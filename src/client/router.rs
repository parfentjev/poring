use anyhow::{Result, anyhow};

use crate::client::event::{
    Authenticate, Cap, Ping, PrivateMessage, RawMessage, SaslSuccess, Welcome,
};

pub(super) trait EventDispatcher {
    fn dispatch<T: 'static>(&mut self, event: T);
}

pub(super) fn dispatch_client_event<T, D>(message: T, dispatcher: &mut D)
where
    T: 'static,
    D: EventDispatcher,
{
    dispatcher.dispatch(message);
}

pub(super) fn dispatch_server_event<D>(raw: RawMessage, dispatcher: &mut D) -> Result<()>
where
    D: EventDispatcher,
{
    match raw.command() {
        "CAP" => process::<Cap, _>(raw, dispatcher),
        "AUTHENTICATE" => process::<Authenticate, _>(raw, dispatcher),
        "903" => process::<SaslSuccess, _>(raw, dispatcher),
        "001" => process::<Welcome, _>(raw, dispatcher),
        "PING" => process::<Ping, _>(raw, dispatcher),
        "PRIVMSG" => process::<PrivateMessage, _>(raw, dispatcher),
        _ => process::<RawMessage, _>(raw, dispatcher),
    }
}

fn process<M, D>(raw: RawMessage, dispatcher: &mut D) -> Result<()>
where
    M: TryFrom<RawMessage> + 'static,
    M::Error: std::fmt::Display,
    D: EventDispatcher,
{
    let message = M::try_from(raw).map_err(|e| anyhow!("failed to convert raw message: {e}"))?;
    dispatcher.dispatch(message);

    Ok(())
}
