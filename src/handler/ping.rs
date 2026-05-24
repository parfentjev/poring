use crate::core::event_manager::EventContext;

pub fn ping_handler(ctx: &mut EventContext) {
    if let Some(text) = ctx.message.text.as_ref() {
        ctx.sender.send(format_args!("PONG :{}", text));
    }
}
