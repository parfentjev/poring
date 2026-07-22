use anyhow::{Context, anyhow};
use log::info;

use crate::client::{
    event::{ClientConnected, ClientDisconnected, Ping, PrivateMessage, Welcome},
    event_manager::{EventContext, EventHandlerResult, EventManager},
};

const VERSION: &str = env!("GIT_COMMIT_HASH");

pub fn register(manager: &mut EventManager) {
    manager.register(client_connected);
    manager.register(client_disconnected);
    manager.register(welcome);
    manager.register(ping);
    manager.register(version);
}

fn client_connected(_: &mut EventContext<ClientConnected>) -> EventHandlerResult {
    info!("connected to the server");
    Ok(())
}

fn client_disconnected(_: &mut EventContext<ClientDisconnected>) -> EventHandlerResult {
    info!("disconnected from the server");
    Ok(())
}

fn welcome(ctx: &mut EventContext<Welcome>) -> EventHandlerResult {
    ctx.send(format_args!("JOIN {}", ctx.config.handler.core.autojoin));

    Ok(())
}

fn ping(ctx: &mut EventContext<Ping>) -> EventHandlerResult {
    ctx.send(format_args!("PONG :{}", ctx.event.token()));
    Ok(())
}

fn version(ctx: &mut EventContext<PrivateMessage>) -> EventHandlerResult {
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
