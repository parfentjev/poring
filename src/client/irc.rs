use std::{
    fmt,
    io::{BufRead, BufReader, Write},
    net::TcpStream,
    time::Duration,
};

use anyhow::Result;

use crate::{
    client::{
        authenticator,
        event_manager::{EventContext, EventManager},
        message,
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

            let mut sender = Sender::new(stream.try_clone()?);
            let reader = BufReader::new(stream);

            authenticator::authenticate(&mut sender)?;
            self.read_messages(reader, sender);

            println!("disconnected");
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
                    eprintln!("read line error: {}", error);
                    continue;
                }
            };

            println!("=> {}", raw_message);
            if let Some(message) = message::parse_raw(&raw_message) {
                event_manager.dispatch(
                    &message.command,
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
        println!("<= {}", message);
        Ok(())
    }
}
