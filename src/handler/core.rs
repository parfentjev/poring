use anyhow::{Context, Result};

use crate::client::{event_manager::EventContext, message::Message};

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
    let Message::Ping { token } = ctx.message else {
        return Ok(());
    };

    ctx.send(format_args!("PONG :{}", token));
    Ok(())
}

pub fn version_handler(ctx: &mut EventContext) -> Result<()> {
    let Message::PrivateMessage { sender, text, .. } = ctx.message else {
        return Ok(());
    };

    if text == "\x01VERSION\x01" {
        let (sender, _) = sender.split_once('!').context("corrupted prefix")?;

        ctx.send(format_args!(
            "NOTICE {} :\x01VERSION poring irc bot: {VERSION}\x01",
            sender
        ));
    }

    Ok(())
}
