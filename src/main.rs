mod config;
mod core;

use config::Config;
use core::client::Client;

use core::event_manager::{self, EventManager};

fn main() {
    let mut event_manager = EventManager::new();
    event_manager.register(
        "PING",
        Box::new(|e| {
            e.sender
                .send(format_args!("PONG :{}", e.message.text.as_ref().unwrap()));
        }),
    );

    let config = Config::new();
    let mut client = Client::new(config, event_manager);
    client.start();
}
