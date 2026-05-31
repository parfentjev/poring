use poring::{
    client::event_manager::EventManager, client::irc::Client, config::Config,
    handler::handler_manager,
};

fn main() {
    let mut event_manager = EventManager::default();
    handler_manager::register_handlers(&mut event_manager);

    let config = Config::default();
    let mut client = Client::new(config, event_manager);
    if let Err(error) = client.start() {
        panic!("irc client error: {}", error);
    }
}
