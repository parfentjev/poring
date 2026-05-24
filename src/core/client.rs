use std::{
    collections::VecDeque,
    fmt,
    io::{BufRead, BufReader, Error, Write},
    net::TcpStream,
};

use crate::{
    config::Config,
    core::event_manager::{EventContext, EventManager},
};

pub struct Client {
    config: Config,
    event_manager: EventManager,
}

impl Client {
    pub fn new(config: Config, event_manager: EventManager) -> Self {
        Client {
            config,
            event_manager,
        }
    }

    pub fn start(&mut self) {
        let Config { server, user, .. } = &self.config;

        let stream = TcpStream::connect(&server.address).expect("failed to connect");
        let mut sender = Sender::new(stream.try_clone().expect("failed to create stream writer"));
        let reader = BufReader::new(stream);

        sender.send(format_args!("NICK {}", user.nickname));
        sender.send(format_args!(
            "USER {} 0 * :{}",
            user.username, user.realname
        ));

        self.read_messages(reader, sender);
    }

    fn read_messages(&mut self, reader: BufReader<TcpStream>, mut sender: Sender) {
        let Client {
            event_manager,
            config,
        } = self;

        for line in reader.lines() {
            let raw_message = match line {
                Ok(result) => result,
                Err(e) => {
                    eprintln!("read line error: {}", e);
                    continue;
                }
            };

            println!("=> {}", raw_message);
            if let Some(message) = parse_raw_message(&raw_message) {
                event_manager.dispatch(
                    &message.command,
                    &mut EventContext::new(&config, &message, &mut sender),
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
        Sender { writer }
    }

    pub fn send(&mut self, message: fmt::Arguments<'_>) {
        let result: Result<(), Error> = (|| {
            self.writer.write_fmt(message)?;
            self.writer.write_all(b"\r\n")?;

            Ok(())
        })();

        match result {
            Ok(..) => println!("<= {}", message),
            Err(e) => eprintln!("tcp write error: {}", e),
        }
    }
}

/*
 * Some fields aren't used by message handlers yet.
 * This isn't a problem that needs to be fixed.
 */
#[allow(unused)]
pub struct Message {
    pub prefix: Option<String>,
    pub command: String,
    pub params: Vec<String>,
    pub text: Option<String>,
}

fn parse_raw_message(raw_message: &str) -> Option<Message> {
    let mut tokens = raw_message.split(' ').collect::<VecDeque<_>>();

    let prefix = match tokens.front() {
        Some(token) if token.starts_with(':') => {
            let prefix = token[1..].to_string();
            tokens.pop_front();
            Some(prefix)
        }
        _ => None,
    };

    let command = match tokens.pop_front() {
        Some(token) => token.to_string(),
        None => return None,
    };

    let params: Vec<String>;
    let mut text = String::new();

    if let Some(text_begins) = tokens.iter().position(|t| t.starts_with(':')) {
        params = tokens
            .iter()
            .take(text_begins)
            .map(|token| token.to_string())
            .collect();

        for (i, token) in tokens.range(text_begins..).enumerate() {
            // need to strip that `:` at the front
            if i == 0 {
                text.push_str(&token[1..]);
                continue;
            }

            text.push(' ');
            text.push_str(token);
        }
    } else {
        params = tokens.iter().map(|token| token.to_string()).collect();
    }

    Some(Message {
        prefix,
        command,
        params,
        text: if text.is_empty() { None } else { Some(text) },
    })
}
