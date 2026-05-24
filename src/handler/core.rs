use crate::core::event_manager::EventContext;

pub fn welcome_handler(ctx: &mut EventContext) {
    ctx.config
        .server
        .autojoin
        .iter()
        .for_each(|channel| ctx.sender.send(format_args!("JOIN {}", channel)));
}

pub fn ping_handler(ctx: &mut EventContext) {
    if let Some(text) = ctx.message.text.as_ref() {
        ctx.sender.send(format_args!("PONG :{}", text));
    }
}
