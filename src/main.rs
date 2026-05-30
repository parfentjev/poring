mod config;
mod core;
mod handler;

use config::Config;
use core::client::Client;

use crate::{core::event_manager::EventManager, handler::handler_manager::register_handlers};

fn main() {
    let mut event_manager = EventManager::new();
    register_handlers(&mut event_manager);

    let config = Config::new();
    let mut client = Client::new(config, event_manager);
    if let Err(error) = client.start() {
        panic!("irc client error: {}", error);
    }
}
