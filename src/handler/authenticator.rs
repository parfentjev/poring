use base64::{Engine, engine::general_purpose::STANDARD};

use crate::{
    client::{
        event::{Authenticate, Cap, ClientConnected, SaslSuccess},
        event_manager::{EventContext, EventHandlerResult, EventManager},
    },
    config::{Identity, Sasl},
};

pub fn register(manager: &mut EventManager) {
    manager.register(client_connected);
    manager.register(cap);
    manager.register(authenticate);
    manager.register(sasl_success);
}

fn client_connected(ctx: &mut EventContext<ClientConnected>) -> EventHandlerResult {
    let identity = &ctx.config.identity;
    if identity.sasl.enabled {
        ctx.send("CAP REQ :sasl");
    } else {
        ctx.send(format_args!("NICK {}", identity.nickname));
        ctx.send(format_args!(
            "USER {} 0 * :{}",
            identity.username, identity.realname
        ));
    }

    Ok(())
}

fn cap(ctx: &mut EventContext<Cap>) -> EventHandlerResult {
    if ctx.event.subcommand() == "ACK" {
        ctx.send("AUTHENTICATE PLAIN");
    }

    Ok(())
}

fn authenticate(ctx: &mut EventContext<Authenticate>) -> EventHandlerResult {
    if ctx.event.data() == "+" {
        let Sasl {
            username, password, ..
        } = &ctx.config.identity.sasl;
        let credentials = STANDARD.encode(format!("\0{username}\0{password}"));

        ctx.send(format_args!("AUTHENTICATE {}", credentials));
    }

    Ok(())
}

fn sasl_success(ctx: &mut EventContext<SaslSuccess>) -> EventHandlerResult {
    let Identity {
        nickname,
        username,
        realname,
        ..
    } = &ctx.config.identity;

    ctx.send("CAP END");
    ctx.send(format_args!("NICK {nickname}"));
    ctx.send(format_args!("USER {username} 0 * :{realname}",));

    Ok(())
}
