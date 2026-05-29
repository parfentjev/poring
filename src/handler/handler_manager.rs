use crate::{
    core::event_manager::EventManager,
    handler::{
        core::{ping_handler, welcome_handler},
        raweceek::raweceek_handler,
    },
};

pub fn register_handlers(manager: &mut EventManager) {
    manager.register("001", Box::new(welcome_handler));
    manager.register("PING", Box::new(ping_handler));
    manager.register("PRIVMSG", Box::new(raweceek_handler));
}
