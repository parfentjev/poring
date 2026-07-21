use std::{
    fmt,
    io::{self, BufRead, BufReader, Write},
    net::TcpStream,
    sync::Arc,
    time::{Duration, Instant},
};

use anyhow::{Result, anyhow};
use log::{debug, info, warn};
use rustls::{ClientConnection, StreamOwned, pki_types::ServerName};
use rustls_platform_verifier::BuilderVerifierExt;

use crate::{
    client::{
        event::{self, RawMessage},
        event_manager::{EventContext, EventManager},
        router::{self, EventDispatcher},
    },
    config::Config,
};

const POLL_INTERVAL: Duration = Duration::from_mins(1);
const CONNECTION_TIMEOUT: Duration = Duration::from_mins(10);

struct Connection {
    reader: BufReader<StreamOwned<ClientConnection, TcpStream>>,
}

pub struct Client<'session> {
    config: &'session Config,
    event_manager: &'session EventManager,
}

impl<'client> Client<'client> {
    pub fn new(config: &'client Config, event_manager: &'client EventManager) -> Self {
        Self {
            config,
            event_manager,
        }
    }

    pub fn run(self) -> Result<()> {
        loop {
            let conn = connect(self.config)?;
            ClientSession::new(self.config, self.event_manager, conn).run();
        }
    }
}

struct ClientSession<'session> {
    config: &'session Config,
    event_manager: &'session EventManager,
    conn: Connection,
    connected_at: Instant,
    last_ping: Option<Instant>,
}

impl<'session> ClientSession<'session> {
    fn new(
        config: &'session Config,
        event_manager: &'session EventManager,
        conn: Connection,
    ) -> Self {
        Self {
            config,
            event_manager,
            conn,
            connected_at: Instant::now(),
            last_ping: None,
        }
    }

    fn run(mut self) {
        router::dispatch_client_event(event::ClientConnected {}, &mut self);
        self.read_messages();
        router::dispatch_client_event(event::ClientDisconnected {}, &mut self);
    }

    fn read_messages(&mut self) {
        loop {
            let mut line = String::new();
            match self.conn.reader.read_line(&mut line) {
                Ok(0) => continue,
                Err(error) if is_transient_err(&error) => {
                    if self.connection_timed_out() {
                        info!("connection time out after {CONNECTION_TIMEOUT:?}");
                        break;
                    }
                    continue;
                }
                Err(error) => {
                    info!("unhandled tcp error: {error}; {}", error.kind());
                    break;
                }
                _ => {
                    if line.ends_with("\r\n") {
                        line.truncate(line.len() - 2);
                        debug!("=> {line}");
                        self.notify_handlers(line);
                    }
                }
            }
        }
    }

    fn notify_handlers(&mut self, message: String) {
        let message = match RawMessage::try_from(message) {
            Ok(message) => message,
            Err(e) => {
                warn!("failed to parse raw_message: {e}");
                return;
            }
        };

        if message.command() == "PING" {
            self.last_ping = Some(Instant::now());
        }

        if let Err(e) = router::dispatch_server_event(message, self) {
            warn!("failed to convert raw_message: {e}");
        }
    }

    fn connection_timed_out(&self) -> bool {
        self.last_ping.unwrap_or(self.connected_at).elapsed() > CONNECTION_TIMEOUT
    }
}

impl EventDispatcher for ClientSession<'_> {
    fn dispatch<T: 'static>(&mut self, event: T) {
        let mut sender = Sender::new(self.conn.reader.get_mut());
        let mut ctx = EventContext::new(self.config, &event, &mut sender);
        self.event_manager.dispatch(&mut ctx);
    }
}

fn connect(config: &Config) -> Result<Connection> {
    let tcp_stream = TcpStream::connect(&config.server.address)?;
    tcp_stream.set_read_timeout(Some(POLL_INTERVAL))?;

    let tls_config = rustls::ClientConfig::builder()
        .with_platform_verifier()?
        .with_no_client_auth();

    let tls_server = ServerName::try_from(
        config
            .server
            .address
            .split_once(':')
            .ok_or_else(|| anyhow!("invalid server address: {}", config.server.address))?
            .0
            .to_owned(),
    )?;

    let tls_conn = rustls::ClientConnection::new(Arc::new(tls_config), tls_server)?;
    let tls_stream = StreamOwned::new(tls_conn, tcp_stream);

    Ok(Connection {
        reader: BufReader::new(tls_stream),
    })
}

fn is_transient_err(error: &io::Error) -> bool {
    matches!(error.kind(), io::ErrorKind::WouldBlock)
}

pub struct Sender<'a> {
    writer: &'a mut dyn Write,
}

impl<'a> Sender<'a> {
    pub fn new(writer: &'a mut dyn Write) -> Self {
        Self { writer }
    }

    pub fn send(&mut self, message: impl fmt::Display) -> Result<()> {
        write!(self.writer, "{}\r\n", message)?;
        self.writer.flush()?;
        debug!("<= {message}");
        Ok(())
    }
}
