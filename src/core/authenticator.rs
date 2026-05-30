use anyhow::Result;
use base64::{Engine, engine::general_purpose::STANDARD};

use crate::core::{
    client::Sender,
    event_manager::{EventContext, EventManager},
};

pub fn init(event_manager: &mut EventManager) {
    event_manager.register("CAP", Box::new(handle_cap));
    event_manager.register("AUTHENTICATE", Box::new(handle_authenticate));
    event_manager.register("903", Box::new(handle_success));
}

pub fn authenticate(sender: &mut Sender) -> Result<()> {
    sender.send("CAP REQ :sasl")
}

fn handle_cap(ctx: &mut EventContext) {
    if ctx.message.params.get(1).is_some_and(|p| p == "ACK") {
        ctx.send("AUTHENTICATE PLAIN");
    }
}

fn handle_authenticate(ctx: &mut EventContext) {
    if ctx.message.params.first().is_some_and(|p| p == "+") {
        let sasl = &ctx.config.user.sasl;
        let credentials = STANDARD.encode(format!("\0{}\0{}", sasl.username, sasl.password));

        ctx.send(format_args!("AUTHENTICATE {}", credentials));
    }
}

fn handle_success(ctx: &mut EventContext) {
    let user = &ctx.config.user;

    ctx.send("CAP END");
    ctx.send(format_args!("NICK {}", user.nickname));
    ctx.send(format_args!(
        "USER {} 0 * :{}",
        user.username, user.realname
    ));
}
