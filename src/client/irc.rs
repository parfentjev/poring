use std::{
    fmt,
    io::{self, BufRead, BufReader, Write},
    net::TcpStream,
    time::{Duration, Instant},
};

use anyhow::Result;
use log::{debug, info, warn};

use crate::{
    client::{
        authenticator::Authenticator,
        event_manager::{EventContext, EventManager},
        message::{Authenticate, Cap, Ping, PrivateMessage, RawMessage, SaslSuccess, Welcome},
    },
    config::Config,
};

const POLL_INTERVAL: Duration = Duration::from_secs(60);
const CONNECTION_TIMEOUT: Duration = Duration::from_secs(10 * 60);

pub struct Client {
    config: Config,
    event_manager: EventManager,
    authenticator: Authenticator,
    connected_at: Option<Instant>,
    last_ping: Option<Instant>,
}

impl Client {
    pub fn new(config: Config, event_manager: EventManager) -> Self {
        Self {
            config,
            event_manager,
            authenticator: Authenticator::default(),
            connected_at: None,
            last_ping: None,
        }
    }

    pub fn start(&mut self) -> Result<()> {
        loop {
            self.connected_at = Some(Instant::now());
            self.last_ping = None;

            let stream = TcpStream::connect(&self.config.server.address)?;
            stream.set_read_timeout(Some(POLL_INTERVAL))?;
            info!("connected to the server");

            let mut sender = Sender::new(stream.try_clone()?);
            let reader = BufReader::new(stream);

            self.authenticator.register(
                &mut self.event_manager,
                &mut sender,
                &self.config.identity,
            )?;
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
                        info!("connection time out after {CONNECTION_TIMEOUT:?}");
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
        let raw_message = match raw_message.parse::<RawMessage>() {
            Ok(raw_message) => raw_message,
            Err(e) => {
                warn!("failed to parse raw_message: {e}");
                return;
            }
        };

        // todo: I don't think the client itself should be responsible for this mapping.
        // The client's essential job is to manage tcp streams.
        // Perhaps I need to add some separate router to manage this logic.
        match raw_message.command() {
            "CAP" => self.dispatch_message::<Cap>(raw_message, sender),
            "AUTHENTICATE" => self.dispatch_message::<Authenticate>(raw_message, sender),
            "903" => self.dispatch_message::<SaslSuccess>(raw_message, sender),
            "001" => self.dispatch_message::<Welcome>(raw_message, sender),
            "PING" => {
                self.last_ping = Some(Instant::now());
                self.dispatch_message::<Ping>(raw_message, sender);
            }
            "PRIVMSG" => self.dispatch_message::<PrivateMessage>(raw_message, sender),
            _ => self.dispatch_message::<RawMessage>(raw_message, sender),
        }
    }

    fn dispatch_message<E>(&self, raw_message: RawMessage, sender: &mut Sender)
    where
        E: TryFrom<RawMessage> + 'static,
        E::Error: fmt::Display,
    {
        match E::try_from(raw_message) {
            Ok(message) => {
                let mut ctx = EventContext::new(&self.config, &message, sender);
                self.event_manager.dispatch(&mut ctx);
            }
            Err(e) => warn!("failed to convert raw_message: {e}"),
        }
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
