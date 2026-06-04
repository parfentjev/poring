use anyhow::{Result, anyhow};
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

pub fn raweceek_handler(ctx: &mut EventContext) -> Result<()> {
    if ctx.message.text != "!ceeks" {
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
        .ok_or_else(|| anyhow!("CEEKS countdown is missing in the response"))?;

    let channel = ctx
        .message
        .params
        .first()
        .ok_or_else(|| anyhow!("channel is undefined in params"))?;

    ctx.send(format_args!(
        "PRIVMSG {} :\x02{}\x02 begins in {} 🎉",
        channel, response.summary, countdown.value
    ));

    Ok(())
}
