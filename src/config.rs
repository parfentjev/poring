use anyhow::anyhow;
use figment::{Figment, providers::Env};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Config {
    pub server: Server,
    pub identity: Identity,
    pub handler: Handler,
}

impl Config {
    pub fn from_env() -> Result<Self, anyhow::Error> {
        Figment::from(
            Env::raw()
                .filter(|key| {
                    key.starts_with("SERVER_")
                        || key.starts_with("IDENTITY_")
                        || key.starts_with("HANDLER_")
                })
                .split("_"),
        )
        .extract()
        .map_err(|e| anyhow!(e))
    }
}

#[derive(Deserialize)]
pub struct Server {
    pub address: String,
}

#[derive(Deserialize)]
pub struct Identity {
    pub nickname: String,
    pub username: String,
    pub realname: String,
    pub sasl: Sasl,
}

#[derive(Deserialize)]
pub struct Sasl {
    pub enabled: bool,
    pub username: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct Handler {
    pub core: Core,
    pub raweceek: Raweceek,
}

#[derive(Deserialize)]
pub struct Core {
    pub autojoin: String,
}

#[derive(Deserialize)]
pub struct Raweceek {
    pub url: String,
}
