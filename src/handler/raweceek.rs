use serde::Deserialize;

use crate::client::event_manager::EventContext;

#[derive(Deserialize, Debug)]
struct Response {
    summary: String,
    countdowns: Vec<Countdown>,
}

#[derive(Deserialize, Debug)]
struct Countdown {
    #[serde(rename = "type")]
    kind: String,
    value: String,
}

pub fn raweceek_handler(ctx: &mut EventContext) {
    if ctx.message.text != "!ceeks" {
        return;
    }

    if let Err(error) = handle(ctx) {
        eprintln!("raweceek_handler error: {}", error);
    }
}

fn handle(ctx: &mut EventContext) -> Result<(), String> {
    let response = ureq::get(&ctx.config.handler.raweceek.url)
        .call()
        .map_err(|e| format!("GET request failed: {}", e))?
        .body_mut()
        .read_json::<Response>()
        .map_err(|e| format!("failed to deserialize response: {}", e))?;

    let countdown = response
        .countdowns
        .iter()
        .find(|countdown| countdown.kind == "CEEKS")
        .ok_or_else(|| format!("CEEKS isn't in response: {:#?}", response))?;

    let channel = ctx
        .message
        .params
        .first()
        .ok_or("channel is undefined in message params")?;

    ctx.send(format_args!(
        "PRIVMSG {} :\x02{}\x02 begins in {} 🎉",
        channel, response.summary, countdown.value
    ));

    Ok(())
}
