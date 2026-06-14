use std::{
    fmt,
    io::{BufRead, BufReader, Write},
    net::TcpStream,
    time::Duration,
};

use anyhow::Result;
use log::{debug, info, warn};

use crate::{
    client::{
        authenticator,
        event_manager::{EventContext, EventManager},
        message::Message,
    },
    config::Config,
};

pub struct Client {
    config: Config,
    event_manager: EventManager,
}

impl Client {
    pub fn new(config: Config, event_manager: EventManager) -> Self {
        Self {
            config,
            event_manager,
        }
    }

    pub fn start(&mut self) -> Result<()> {
        authenticator::init(&mut self.event_manager);

        loop {
            let stream = TcpStream::connect(&self.config.server.address)?;
            stream.set_read_timeout(Some(Duration::from_mins(10)))?;

            info!("connected to the server");

            let mut sender = Sender::new(stream.try_clone()?);
            let reader = BufReader::new(stream);

            authenticator::authenticate(&mut sender)?;
            self.read_messages(reader, sender);

            info!("disconnected from the server");
        }
    }

    fn read_messages(&mut self, reader: BufReader<TcpStream>, mut sender: Sender) {
        let Client {
            event_manager,
            config,
        } = self;

        for line in reader.lines() {
            let raw_message = match line {
                Ok(result) => result,
                Err(error) => {
                    warn!("read line error: {error}");
                    continue;
                }
            };

            debug!("=> {raw_message}");
            if let Some(message) = Message::build(raw_message) {
                event_manager.dispatch(
                    message.command(),
                    &mut EventContext::new(config, &message, &mut sender),
                );
            }
        }
    }
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
