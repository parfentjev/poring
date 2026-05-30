use std::{collections::HashMap, fmt};

use crate::{
    config::Config,
    core::client::{Message, Sender},
};

pub struct EventContext<'a> {
    pub config: &'a Config,
    pub message: &'a Message,
    sender: &'a mut Sender,
}

impl<'a> EventContext<'a> {
    pub fn new(config: &'a Config, message: &'a Message, sender: &'a mut Sender) -> Self {
        Self {
            config,
            message,
            sender,
        }
    }

    pub fn send(&mut self, message: impl fmt::Display) {
        if let Err(error) = self.sender.send(message) {
            eprintln!("failed to send a message: {}", error);
        }
    }
}

type EventHandler = dyn Fn(&mut EventContext);

pub struct EventManager {
    handlers: HashMap<String, Vec<Box<EventHandler>>>,
}

impl EventManager {
    pub fn new() -> Self {
        Self {
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
