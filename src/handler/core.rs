use crate::client::{
    event_manager::{EventContext, EventHandlerResult},
    message::Message,
};

const VERSION: &str = env!("GIT_COMMIT_HASH");

pub fn welcome_handler(ctx: &mut EventContext) -> EventHandlerResult {
    ctx.config
        .server
        .autojoin
        .iter()
        .for_each(|channel| ctx.send(format_args!("JOIN {}", channel)));

    Ok(())
}

pub fn ping_handler(ctx: &mut EventContext) -> EventHandlerResult {
    let Message::Ping { token } = ctx.message else {
        return Ok(());
    };

    ctx.send(format_args!("PONG :{}", token));
    Ok(())
}

pub fn version_handler(ctx: &mut EventContext) -> EventHandlerResult {
    let Message::PrivateMessage { sender, text, .. } = ctx.message else {
        return Ok(());
    };

    if text == "\x01VERSION\x01" {
        let (sender, _) = sender.split_once('!').ok_or("corrupted prefix")?;

        ctx.send(format_args!(
            "NOTICE {} :\x01VERSION poring irc bot: {VERSION}\x01",
            sender
        ));
    }

    Ok(())
}
