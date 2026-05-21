use std::{
    fmt,
    io::{BufRead, BufReader, Error, Write},
    net::TcpStream,
};

use crate::config::Config;

const USER_MESSAGE: &str = "USER poring 0 * :https://codeberg.org/parfentjev/poring/";

pub struct Client {
    config: Config,
}

impl Client {
    pub fn new(config: Config) -> Self {
        Client { config }
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
            if let Some(token) = raw_message.strip_prefix("PING :") {
                write(&mut writer, format_args!("PONG :{}", token));
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

/*
fn parse_raw_message(raw_message: &str) {
    let tokens = raw_message.split(' ').collect::<Vec<_>>();
    let mut params = Vec::new();

    let mut prefix: String;
    let mut command: String;
    let mut text: String;
}
*/
