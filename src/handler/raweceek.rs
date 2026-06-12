use anyhow::{Context, Result};
use serde::Deserialize;

use crate::client::{event_manager::EventContext, message::Message};

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

pub fn raweceek_handler(ctx: &mut EventContext) -> Result<()> {
    let Message::PrivateMessage { receiver, text, .. } = ctx.message else {
        return Ok(());
    };

    if text != "!ceeks" || !receiver.starts_with('#') {
        return Ok(());
    }

    let response = ureq::get(&ctx.config.handler.raweceek.url)
        .call()?
        .body_mut()
        .read_json::<Response>()?;

    let countdown = response
        .countdowns
        .iter()
        .find(|countdown| countdown.kind == "CEEKS")
        .context("CEEKS countdown is missing in the response")?;

    ctx.send(format_args!(
        "PRIVMSG {} :\x02{}\x02 begins in {} 🎉",
        receiver, response.summary, countdown.value
    ));

    Ok(())
}
