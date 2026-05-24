use std::collections::HashMap;

use crate::{
    config::Config,
    core::client::{Message, Sender},
};

pub struct EventContext<'a> {
    pub config: &'a Config,
    pub message: &'a Message,
    pub sender: &'a mut Sender,
}

impl<'a> EventContext<'a> {
    pub fn new(config: &'a Config, message: &'a Message, sender: &'a mut Sender) -> Self {
        EventContext {
            config,
            message,
            sender,
        }
    }
}

type EventHandler = dyn Fn(&mut EventContext);

pub struct EventManager {
    handlers: HashMap<String, Vec<Box<EventHandler>>>,
}

impl EventManager {
    pub fn new() -> Self {
        EventManager {
            handlers: HashMap::new(),
        }
    }

    pub fn register(&mut self, event: impl Into<String>, handler: Box<EventHandler>) {
        self.handlers.entry(event.into()).or_default().push(handler);
    }

    pub fn dispatch(&self, event: &str, context: &mut EventContext) {
        if let Some(handlers) = self.handlers.get(event) {
            handlers.iter().for_each(|h| h(context));
        }
    }
}
