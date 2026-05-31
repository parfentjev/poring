#[derive(Default)]
pub struct Config {
    pub server: ServerConfig,
    pub user: UserConfig,
    pub handler: HandlerConfig,
}

pub struct ServerConfig {
    pub address: String,
    pub autojoin: Vec<String>,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            address: env("SERVER_ADDRESS"),
            autojoin: env("SERVER_AUTOJOIN")
                .split(',')
                .map(str::to_string)
                .collect(),
        }
    }
}

pub struct UserConfig {
    pub nickname: String,
    pub username: String,
    pub realname: String,
    pub sasl: AuthenticatorConfig,
}

impl Default for UserConfig {
    fn default() -> Self {
        Self {
            nickname: env("USER_NICKNAME"),
            username: env("USER_USERNAME"),
            realname: env("USER_REALNAME"),
            sasl: AuthenticatorConfig::default(),
        }
    }
}

pub struct AuthenticatorConfig {
    pub username: String,
    pub password: String,
}

impl Default for AuthenticatorConfig {
    fn default() -> Self {
        Self {
            username: env("USER_SASL_USERNAME"),
            password: env("USER_SASL_PASSWORD"),
        }
    }
}

#[derive(Default)]
pub struct HandlerConfig {
    pub raweceek: RaweceekConfig,
}

pub struct RaweceekConfig {
    pub url: String,
}

impl Default for RaweceekConfig {
    fn default() -> Self {
        Self {
            url: env("HANDLER_RAWECEEK_URL"),
        }
    }
}

fn env(key: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| panic!("environment variable '{}' is missing", key))
}
