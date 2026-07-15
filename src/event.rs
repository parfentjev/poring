use std::{
    any::{self, Any, TypeId},
    collections::HashMap,
};

use anyhow::Result;
use log::{error, warn};

pub struct EventContext<'a, S, E> {
    pub state: &'a mut S,
    pub event: &'a E,
}

pub type EventHandlerResult = Result<()>;
type EventHandlerVec<S, E> = Vec<Box<dyn Fn(&mut EventContext<S, E>) -> EventHandlerResult>>;

pub struct EventManager {
    event_to_handlers_map: HashMap<TypeId, Box<dyn Any>>,
}

// This solution is built upon examples shared here:
// https://willcrichton.net/rust-api-type-patterns/registries.html
impl EventManager {
    pub fn new() -> EventManager {
        EventManager {
            event_to_handlers_map: HashMap::new(),
        }
    }

    pub fn register<S, E, H>(&mut self, handler: H)
    where
        S: 'static,
        E: 'static,
        H: Fn(&mut EventContext<S, E>) -> EventHandlerResult + 'static,
    {
        let type_id = TypeId::of::<EventHandlerVec<S, E>>();

        self.event_to_handlers_map
            .entry(type_id)
            .or_insert_with(|| Box::new(EventHandlerVec::<S, E>::new()))
            .downcast_mut::<EventHandlerVec<S, E>>()
            .unwrap()
            .push(Box::new(handler));
    }

    pub fn dispatch<S, E>(&self, ctx: &mut EventContext<S, E>)
    where
        S: 'static,
        E: 'static,
    {
        let type_id = TypeId::of::<EventHandlerVec<S, E>>();
        let Some(handlers) = self.event_to_handlers_map.get(&type_id) else {
            return;
        };

        let Some(handlers) = handlers.downcast_ref::<EventHandlerVec<S, E>>() else {
            error!(
                "failed to downcast for: EventHandlerVec<{}, {}>",
                any::type_name::<S>(),
                any::type_name::<E>()
            );
            return;
        };

        handlers
            .iter()
            .for_each(|h| _ = h(ctx).inspect_err(|e| warn!("handler error: {e}")));
    }
}
