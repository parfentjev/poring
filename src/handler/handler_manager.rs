use crate::{
    client::event_manager::EventManager,
    handler::{authenticator, core, raweceek},
};

pub fn register_handlers(manager: &mut EventManager) {
    authenticator::register_handlers(manager);
    core::register_handlers(manager);
    manager.register(raweceek::raweceek_handler);
}
