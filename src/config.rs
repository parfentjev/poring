pub struct Config {
    pub server: ServerConfig,
    pub user: UserConfig,
    pub handler: HandlerConfig,
}

impl Config {
    pub fn new() -> Self {
        Self {
            server: ServerConfig::default(),
            user: UserConfig::default(),
            handler: HandlerConfig::default(),
        }
    }
}

pub struct ServerConfig {
    pub address: String,
    pub autojoin: Vec<String>,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            address: get("SERVER_ADDRESS"),
            autojoin: get("SERVER_AUTOJOIN")
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
            nickname: get("USER_NICKNAME"),
            username: get("USER_USERNAME"),
            realname: get("USER_REALNAME"),
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
            username: get("USER_SASL_USERNAME"),
            password: get("USER_SASL_PASSWORD"),
        }
    }
}

pub struct HandlerConfig {
    pub raweceek: RaweceekConfig,
}

impl Default for HandlerConfig {
    fn default() -> Self {
        Self {
            raweceek: RaweceekConfig::default(),
        }
    }
}

pub struct RaweceekConfig {
    pub url: String,
}

impl Default for RaweceekConfig {
    fn default() -> Self {
        Self {
            url: get("HANDLER_RAWECEEK_URL"),
        }
    }
}

fn get(key: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| panic!("environment variable '{}' is missing", key))
}
