use std::{
    any::{self, Any, TypeId},
    collections::HashMap,
    fmt,
};

use anyhow::Result;
use log::{error, warn};

use crate::{client::irc::Sender, config::Config};

pub struct EventContext<'a, E> {
    pub config: &'a Config,
    pub event: &'a E,
    sender: &'a mut Sender,
}

impl<'a, E> EventContext<'a, E> {
    pub fn new(config: &'a Config, event: &'a E, sender: &'a mut Sender) -> Self {
        Self {
            config,
            event,
            sender,
        }
    }

    pub fn send(&mut self, message: impl fmt::Display) {
        if let Err(error) = self.sender.send(message) {
            warn!("failed to send a message: {error}");
        }
    }
}

pub type EventHandlerResult = Result<()>;

type HandlerVec<E> = Vec<Box<dyn Fn(&mut EventContext<E>) -> EventHandlerResult>>;

#[derive(Default)]
pub struct EventManager {
    event_handlers_map: HashMap<TypeId, Box<dyn Any>>,
}

// This solution is built upon examples shared here:
// https://willcrichton.net/rust-api-type-patterns/registries.html
impl EventManager {
    pub fn new() -> EventManager {
        EventManager {
            event_handlers_map: HashMap::new(),
        }
    }

    pub fn register<E, H>(&mut self, handler: H)
    where
        E: 'static,
        H: Fn(&mut EventContext<E>) -> EventHandlerResult + 'static,
    {
        let type_id = TypeId::of::<HandlerVec<E>>();

        self.event_handlers_map
            .entry(type_id)
            .or_insert_with(|| Box::new(HandlerVec::<E>::new()))
            .downcast_mut::<HandlerVec<E>>()
            .unwrap()
            .push(Box::new(handler));
    }

    pub fn dispatch<E: 'static>(&self, ctx: &mut EventContext<E>) {
        let type_id = TypeId::of::<HandlerVec<E>>();
        let Some(handlers) = self.event_handlers_map.get(&type_id) else {
            return;
        };

        let Some(handlers) = handlers.downcast_ref::<HandlerVec<E>>() else {
            error!("failed to downcast for: {}", any::type_name::<E>());
            return;
        };

        handlers
            .iter()
            .for_each(|handler| _ = handler(ctx).inspect_err(|e| warn!("handler error: {e}")));
    }
}
