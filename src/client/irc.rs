use std::{
    fmt,
    io::{self, BufRead, BufReader, Write},
    net::TcpStream,
    time::{Duration, Instant},
};

use anyhow::Result;
use log::{debug, info};

use crate::{
    client::{
        authenticator,
        event_manager::{EventContext, EventManager},
        message::Message,
    },
    config::Config,
};

const POLL_INTERVAL: Duration = Duration::from_secs(10);

pub struct Client {
    config: Config,
    event_manager: EventManager,
    connected_at: Option<Instant>,
    last_ping: Option<Instant>,
}

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
        authenticator::init(&mut self.event_manager);

        loop {
            self.connected_at = Some(Instant::now());
            self.last_ping = None;

            let stream = TcpStream::connect(&self.config.server.address)?;
            stream.set_read_timeout(Some(POLL_INTERVAL))?;
            info!("connected to the server");

            let mut sender = Sender::new(stream.try_clone()?);
            let reader = BufReader::new(stream);

            authenticator::authenticate(&mut sender)?;
            self.read_messages(reader, sender);

            info!("disconnected from the server");
        }
    }

    fn read_messages(&mut self, reader: BufReader<TcpStream>, mut sender: Sender) {
        for line in reader.lines() {
            let raw_message = match line {
                Ok(result) => result,
                Err(error) if is_transient_err(&error) => {
                    if self.connection_timed_out() {
                        info!("connection time out after {:?}", self.config.server.timeout);
                        break;
                    }
                    continue;
                }
                Err(error) => {
                    info!("unhandled tcp error: {error}; {}", error.kind());
                    break;
                }
            };

            debug!("=> {raw_message}");
            self.notify_handlers(raw_message, &mut sender);
        }
    }

    fn notify_handlers(&mut self, raw_message: String, sender: &mut Sender) {
        let Some(message) = Message::build(raw_message) else {
            return;
        };

        if message.command() == "PING" {
            self.last_ping = Some(Instant::now());
        }

        self.event_manager.dispatch(
            message.command(),
            &mut EventContext::new(&self.config, &message, sender),
        );
    }

    fn connection_timed_out(&self) -> bool {
        self.last_ping
            .or(self.connected_at)
            .is_some_and(|last_active| last_active.elapsed() > self.config.server.timeout)
    }
}

// I'll probably add more error kinds with a match statement,
// So this short function will grow and start making more sense.
fn is_transient_err(error: &io::Error) -> bool {
    matches!(error.kind(), io::ErrorKind::WouldBlock)
}

pub struct Sender {
    writer: TcpStream,
}

impl Sender {
    fn new(writer: TcpStream) -> Self {
        Self { writer }
    }

    pub fn send(&mut self, message: impl fmt::Display) -> Result<()> {
        write!(self.writer, "{}\r\n", message)?;
        self.writer.flush()?;
        debug!("<= {message}");
        Ok(())
    }
}
