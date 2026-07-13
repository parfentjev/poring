use anyhow::{Context, anyhow};

use crate::client::{
    event_manager::{EventContext, EventHandlerResult},
    message::{Ping, PrivateMessage, Welcome},
};

const VERSION: &str = env!("GIT_COMMIT_HASH");

pub fn welcome_handler(ctx: &mut EventContext<Welcome>) -> EventHandlerResult {
    ctx.config
        .server
        .autojoin
        .iter()
        .for_each(|channel| ctx.send(format_args!("JOIN {}", channel)));

    Ok(())
}

pub fn ping_handler(ctx: &mut EventContext<Ping>) -> EventHandlerResult {
    ctx.send(format_args!("PONG :{}", ctx.event.token()));
    Ok(())
}

pub fn version_handler(ctx: &mut EventContext<PrivateMessage>) -> EventHandlerResult {
    let e = ctx.event;
    if e.text() == "\x01VERSION\x01" {
        let (sender, _) = e
            .sender()
            .split_once('!')
            .with_context(|| anyhow!("corrupted prefix: {}", e.sender()))?;

        ctx.send(format_args!("NOTICE {} :\x01VERSION {VERSION}\x01", sender));
    }

    Ok(())
}
