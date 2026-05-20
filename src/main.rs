mod client;

use client::{Client, Config};

fn main() {
    let config = Config::new();
    let mut client = Client::connect(config);
    client.run();
}
