use crate::{
    core::event_manager::EventManager,
    handler::core::{ping_handler, welcome_handler},
};

pub fn register_handlers(event_manager: &mut EventManager) {
    event_manager.register("001", Box::new(welcome_handler));
    event_manager.register("PING", Box::new(ping_handler));
}
