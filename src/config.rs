use anyhow::{Result, anyhow};
use figment::{Figment, providers::Env};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Config {
    pub server: Server,
    pub identity: Identity,
    pub handler: Handler,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Figment::new()
            .merge(Env::raw().split("_"))
            .extract()
            .map_err(|e| anyhow!("parse config error: {e}"))
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
