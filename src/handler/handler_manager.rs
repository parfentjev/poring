use crate::{
    client::event_manager::EventManager,
    handler::{core, raweceek},
};

pub fn register_handlers(manager: &mut EventManager) {
    manager.register("001", Box::new(core::welcome_handler));
    manager.register("PING", Box::new(core::ping_handler));
    manager.register("PRIVMSG", Box::new(raweceek::raweceek_handler));
}
