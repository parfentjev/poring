use std::collections::HashMap;

use crate::core::client::{Message, Sender};

pub struct EventContext<'a> {
    pub message: &'a Message,
    pub sender: &'a mut Sender,
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
