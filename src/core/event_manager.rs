use std::collections::HashMap;

pub struct EventManager {
    handlers: HashMap<String, String>,
}

impl EventManager {
    pub fn new() -> Self {
        EventManager {
            handlers: HashMap::new(),
        }
    }

    pub fn register(&mut self, event: String, handler: String) {
        self.handlers.insert(event, handler);
    }

    pub fn emit(&self, event: String, context: String) {
        if let Some(handler) = self.handlers.get(&event) {
            println!("{}: {}", handler, context);
        }
    }
}
