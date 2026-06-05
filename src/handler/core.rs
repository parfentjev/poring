use anyhow::{Context, Result};

use crate::client::event_manager::EventContext;

const VERSION: &str = env!("GIT_COMMIT_HASH");

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

pub fn version_handler(ctx: &mut EventContext) -> Result<()> {
    if ctx.message.text == "\x01VERSION\x01" {
        let (sender, _) = ctx
            .message
            .prefix
            .as_deref()
            .context("missing prefix")?
            .split_once('!')
            .context("corrupted prefix")?;

        ctx.send(format_args!(
            "NOTICE {} :\x01VERSION poring irc bot: {VERSION}\x01",
            sender
        ));
    }

    Ok(())
}
