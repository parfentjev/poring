use anyhow::Result;
use base64::{Engine, engine::general_purpose::STANDARD};

use crate::{
    client::{
        event_manager::{EventContext, EventHandlerResult, EventManager},
        irc::Sender,
        message::{Authenticate, Cap, SaslSuccess},
    },
    config::{AuthenticatorConfig, UserConfig},
};

#[derive(Default)]
pub struct Authenticator {
    handlers_registered: bool,
}

impl Authenticator {
    pub fn request_sasl(
        &mut self,
        event_manager: &mut EventManager,
        sender: &mut Sender,
    ) -> Result<()> {
        self.register_handlers(event_manager);
        sender.send("CAP REQ :sasl")
    }

    fn register_handlers(&mut self, event_manager: &mut EventManager) {
        if self.handlers_registered {
            return;
        }

        event_manager.register(handle_cap);
        event_manager.register(handle_authenticate);
        event_manager.register(handle_success);

        self.handlers_registered = true;
    }
}

fn handle_cap(ctx: &mut EventContext<Cap>) -> EventHandlerResult {
    if ctx.event.subcommand() == "ACK" {
        ctx.send("AUTHENTICATE PLAIN");
    }

    Ok(())
}

fn handle_authenticate(ctx: &mut EventContext<Authenticate>) -> EventHandlerResult {
    if ctx.event.data() == "+" {
        let AuthenticatorConfig { username, password } = &ctx.config.user.sasl;
        let credentials = STANDARD.encode(format!("\0{username}\0{password}"));

        ctx.send(format_args!("AUTHENTICATE {}", credentials));
    }

    Ok(())
}

fn handle_success(ctx: &mut EventContext<SaslSuccess>) -> EventHandlerResult {
    let UserConfig {
        nickname,
        username,
        realname,
        ..
    } = &ctx.config.user;

    ctx.send("CAP END");
    ctx.send(format_args!("NICK {nickname}"));
    ctx.send(format_args!("USER {username} 0 * :{realname}",));

    Ok(())
}
