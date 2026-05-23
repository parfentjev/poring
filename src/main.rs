mod config;
mod core;

use config::Config;
use core::client::Client;

use crate::core::event_manager::{self, EventManager};

fn main() {
    let mut event_manager = EventManager::new();
    event_manager.register(String::from("PRIVMSG"), String::from("handling PRIVMSG"));

    let config = Config::new();
    let mut client = Client::new(config, event_manager);
    client.start();
}
