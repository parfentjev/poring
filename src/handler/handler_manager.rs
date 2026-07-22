use crate::{
    client::event_manager::EventManager,
    handler::{authenticator, core, raweceek},
};

pub fn register_handlers(manager: &mut EventManager) {
    authenticator::register(manager);
    core::register(manager);
    raweceek::register(manager);
}
