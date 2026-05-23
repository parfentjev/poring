use std::{
    collections::VecDeque,
    fmt,
    io::{BufRead, BufReader, Error, Write},
    net::TcpStream,
};

use crate::{config::Config, event_manager::EventManager};

const USER_MESSAGE: &str = "USER poring 0 * :https://codeberg.org/parfentjev/poring/";

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
        let stream = TcpStream::connect(&self.config.server).expect("failed to connect");
        let mut writer = stream.try_clone().expect("failed to create stream writer");
        let reader = BufReader::new(stream);

        write(&mut writer, format_args!("NICK {}", self.config.nickname));
        write(&mut writer, format_args!("{}", USER_MESSAGE));

        for channel in &self.config.channels {
            let join_message = format_args!("JOIN {}", channel);
            write(&mut writer, join_message);
        }

        self.read_messages(writer, reader);
    }

    fn read_messages(&mut self, mut writer: TcpStream, reader: BufReader<TcpStream>) {
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
                self.event_manager
                    .emit(message.command, String::from("some context"));
                // if let Some(text) = message.text
                //     && message.command == "PING"
                // {
                //     write(&mut writer, format_args!("PONG :{}", text));
                // }
            }
        }
    }
}

// todo: move to IrcResponder
fn write(writer: &mut TcpStream, message: fmt::Arguments<'_>) {
    // todo: perhaps switch to try expression once it's available
    let result: Result<(), Error> = (|| {
        writer.write_fmt(message)?;
        writer.write_all(b"\r\n")?;

        Ok(())
    })();

    match result {
        Ok(..) => println!("<= {}", message),
        Err(e) => eprintln!("tcp write error: {}", e),
    }
}

struct Message {
    prefix: Option<String>,
    command: String,
    params: Vec<String>,
    text: Option<String>,
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
            .map(|p| p.to_string())
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
        params = tokens.iter().map(|p| p.to_string()).collect();
    }

    Some(Message {
        prefix,
        command,
        params,
        text: Some(text),
    })
}
