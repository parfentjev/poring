use anyhow::Result;

use crate::client::event_manager::EventContext;

pub fn welcome_handler(ctx: &mut EventContext) -> Result<()> {
    ctx.config
        .server
        .autojoin
        .iter()
        .for_each(|channel| ctx.send(format_args!("JOIN {}", channel)));

    Ok(())
}

pub fn ping_handler(ctx: &mut EventContext) -> Result<()> {
    ctx.send(format_args!("PONG :{}", ctx.message.text));

    Ok(())
}
