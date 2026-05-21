mod client;
mod config;

use client::Client;
use config::Config;

fn main() {
    let config = Config::new();
    let mut client = Client::new(config);
    // client.addHandler("PING", someFn);
    client.start();
}
