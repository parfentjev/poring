use crate::core::event_manager::EventContext;

pub fn welcome_handler(ctx: &mut EventContext) {
    ctx.config
        .server
        .autojoin
        .iter()
        .for_each(|channel| ctx.send(format_args!("JOIN {}", channel)));
}

pub fn ping_handler(ctx: &mut EventContext) {
    ctx.send(format_args!("PONG :{}", ctx.message.text));
}
