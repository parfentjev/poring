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

pub fn authenticate(sender: &mut Sender) {
    sender.send(format_args!("CAP REQ :sasl"));
}

fn handle_cap(ctx: &mut EventContext) {
    if let Some(response) = ctx.message.params.get(1)
        && response == "ACK"
    {
        ctx.sender.send(format_args!("AUTHENTICATE PLAIN"));
    }
}

fn handle_authenticate(ctx: &mut EventContext) {
    if let Some(response) = ctx.message.params.first()
        && response == "+"
    {
        let credentials = STANDARD.encode(format!(
            "\0{}\0{}",
            ctx.config.user.sasl.username, ctx.config.user.sasl.password
        ));

        ctx.sender
            .send(format_args!("AUTHENTICATE {}", credentials));
    }
}

fn handle_success(ctx: &mut EventContext) {
    ctx.sender.send(format_args!("CAP END"));
    ctx.sender
        .send(format_args!("NICK {}", ctx.config.user.nickname));
    ctx.sender.send(format_args!(
        "USER {} 0 * :{}",
        ctx.config.user.username, ctx.config.user.realname
    ));
}
