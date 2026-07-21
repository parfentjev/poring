use std::process;

use log::error;
use poring::{
    client::event_manager::EventManager, client::irc::Client, config::Config,
    handler::handler_manager,
};
use rustls::crypto::ring;

fn main() {
    env_logger::builder()
        .target(env_logger::Target::Stdout)
        .init();

    ring::default_provider().install_default().unwrap();

    let mut event_manager = EventManager::default();
    handler_manager::register_handlers(&mut event_manager);

    let config = Config::from_env().unwrap_or_else(|error| {
        error!("invalid configuration: {error}");
        process::exit(1);
    });

    let client = Client::new(&config, &event_manager);
    if let Err(error) = client.run() {
        error!("irc client stopped: {error}");
        process::exit(1);
    }
}
