use crate::{
    client::event_manager::EventManager,
    handler::{core, raweceek},
};

pub fn register_handlers(manager: &mut EventManager) {
    manager.register(core::welcome_handler);
    manager.register(core::ping_handler);
    manager.register(raweceek::raweceek_handler);
    manager.register(core::version_handler);
}
