use std::time::Duration;

use anyhow::{Context, anyhow};
use serde::Deserialize;

use crate::client::{
    event::PrivateMessage,
    event_manager::{EventContext, EventHandlerResult, EventManager},
};

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

pub fn register(manager: &mut EventManager) {
    manager.register(handler);
}

fn handler(ctx: &mut EventContext<PrivateMessage>) -> EventHandlerResult {
    let e = ctx.event;
    if e.text() != "!ceeks" || !e.receiver().starts_with('#') {
        return Ok(());
    }

    let response = ureq::get(&ctx.config.handler.raweceek.url)
        .config()
        .timeout_global(Some(Duration::from_secs(1)))
        .build()
        .call()?
        .body_mut()
        .read_json::<Response>()?;

    let countdown = response
        .countdowns
        .iter()
        .find(|countdown| countdown.kind == "CEEKS")
        .with_context(|| anyhow!("CEEKS countdown is missing: {response:?}"))?;

    ctx.send(format_args!(
        "PRIVMSG {} :\x02{}\x02 begins in {} 🎉",
        e.receiver(),
        response.summary,
        countdown.value
    ));

    Ok(())
}
