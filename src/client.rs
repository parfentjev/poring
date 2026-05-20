use std::{
    io::{BufRead, BufReader, Read, Write},
    net::TcpStream,
};

pub struct Client {
    config: Config,
    reader: BufReader<TcpStream>,
    writer: TcpStream,
}

impl Client {
    pub fn connect(config: Config) -> Self {
        let stream = TcpStream::connect(&config.server).expect("failed to connect");
        let writer = stream.try_clone().expect("failed to create stream writer");
        let reader = BufReader::new(stream);

        Client {
            config,
            reader,
            writer,
        }
    }

    pub fn run(&mut self) {
        let Client {
            config,
            reader,
            writer,
        } = &mut *self;

        Client::write(writer, &format!("NICK {}", config.nickname));
        Client::write(
            writer,
            "USER poring 0 * :https://codeberg.org/parfentjev/poring/",
        );

        config
            .channels
            .iter()
            .map(|c| format!("JOIN {}", c))
            .for_each(|m| Client::write(writer, &m));

        for line in reader.by_ref().lines() {
            let raw_message = match line {
                Ok(result) => result,
                Err(e) => {
                    eprintln!("read line error: {}", e);
                    continue;
                }
            };

            println!("=> {}", raw_message);
            if let Some(token) = raw_message.strip_prefix("PING :") {
                Client::write(writer, format!("PONG :{}", token).as_str());
            }
        }
    }

    fn write(writer: &mut TcpStream, message: &str) {
        let formatted_message = format!("{}\r\n", message);
        match writer.write_all(formatted_message.as_bytes()) {
            Ok(..) => print!("<= {}", formatted_message),
            Err(e) => eprintln!("tcp write error: {}", e),
        };
    }
}

pub struct Config {
    server: String,
    nickname: String,
    channels: Vec<String>,
}

impl Config {
    pub fn new() -> Self {
        Config {
            server: String::from("irc.eu.libera.chat:6667"),
            nickname: String::from("rusting"),
            channels: vec![String::from("#prontera_field")],
        }
    }
}
