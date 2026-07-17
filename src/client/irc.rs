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
        event_manager::{EventContext, EventManager},
        message::{Authenticate, Cap, Ping, PrivateMessage, RawMessage, SaslSuccess, Welcome},
    },
    config::Config,
};

const POLL_INTERVAL: Duration = Duration::from_mins(1);
const CONNECTION_TIMEOUT: Duration = Duration::from_mins(10);

pub struct Client {
    config: Config,
    event_manager: EventManager,
    connected_at: Option<Instant>,
    last_ping: Option<Instant>,
}

pub struct Connection {
    pub reader: BufReader<StreamOwned<ClientConnection, TcpStream>>,
}

pub struct ClientConnected {}

pub struct ClientDisconnected {}

impl Client {
    pub fn new(config: Config, event_manager: EventManager) -> Self {
        Self {
            config,
            event_manager,
            connected_at: None,
            last_ping: None,
        }
    }

    pub fn start(&mut self) -> Result<()> {
        loop {
            let mut conn = self.connect()?;
            self.connected_at = Some(Instant::now());
            self.last_ping = None;

            self.dispatch_message(&mut conn, ClientConnected {});
            self.read_messages(&mut conn);
            self.dispatch_message(&mut conn, ClientDisconnected {});
        }
    }

    fn connect(&self) -> Result<Connection> {
        let tcp_stream = TcpStream::connect(&self.config.server.address)?;
        tcp_stream.set_read_timeout(Some(POLL_INTERVAL))?;

        let tls_config = rustls::ClientConfig::builder()
            .with_platform_verifier()?
            .with_no_client_auth();

        let tls_server = ServerName::try_from(
            self.config
                .server
                .address
                .split_once(':')
                .ok_or_else(|| anyhow!("invalid server address: {}", self.config.server.address))?
                .0
                .to_owned(),
        )?;

        let tls_conn = rustls::ClientConnection::new(Arc::new(tls_config), tls_server)?;
        let tls_stream = StreamOwned::new(tls_conn, tcp_stream);

        Ok(Connection {
            reader: BufReader::new(tls_stream),
        })
    }

    fn read_messages(&mut self, conn: &mut Connection) {
        loop {
            let mut line = String::new();
            match conn.reader.read_line(&mut line) {
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
                        self.notify_handlers(conn, line);
                    }
                }
            }
        }
    }

    fn notify_handlers(&mut self, conn: &mut Connection, message: String) {
        let message = match RawMessage::try_from(message) {
            Ok(message) => message,
            Err(e) => {
                warn!("failed to parse raw_message: {e}");
                return;
            }
        };

        // todo: I don't think the client itself should be responsible for this mapping.
        // The client's essential job is to manage tcp streams.
        // Perhaps I need to add some separate router to manage this logic.
        match message.command() {
            "CAP" => self.process_raw_message::<Cap>(conn, message),
            "AUTHENTICATE" => self.process_raw_message::<Authenticate>(conn, message),
            "903" => self.process_raw_message::<SaslSuccess>(conn, message),
            "001" => self.process_raw_message::<Welcome>(conn, message),
            "PING" => {
                self.last_ping = Some(Instant::now());
                self.process_raw_message::<Ping>(conn, message);
            }
            "PRIVMSG" => self.process_raw_message::<PrivateMessage>(conn, message),
            _ => self.process_raw_message::<RawMessage>(conn, message),
        }
    }

    fn process_raw_message<E>(&self, conn: &mut Connection, message: RawMessage)
    where
        E: TryFrom<RawMessage> + 'static,
        E::Error: fmt::Display,
    {
        match E::try_from(message) {
            Ok(message) => self.dispatch_message(conn, message),
            Err(e) => warn!("failed to convert raw_message: {e}"),
        }
    }

    fn dispatch_message<T>(&self, conn: &mut Connection, message: T)
    where
        T: 'static,
    {
        let mut sender = Sender::new(conn.reader.get_mut());
        let mut ctx = EventContext::new(&self.config, &message, &mut sender);
        self.event_manager.dispatch(&mut ctx);
    }

    fn connection_timed_out(&self) -> bool {
        self.last_ping
            .or(self.connected_at)
            .is_some_and(|last_active| last_active.elapsed() > CONNECTION_TIMEOUT)
    }
}

// I'll probably add more error kinds with a match statement,
// So this short function will grow and start making more sense.
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
