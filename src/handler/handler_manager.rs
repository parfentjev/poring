use crate::{core::event_manager::EventManager, handler::ping::ping_handler};

pub fn register_handlers(event_manager: &mut EventManager) {
    event_manager.register("PING", Box::new(ping_handler));
}
