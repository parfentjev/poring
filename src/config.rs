pub struct Config {
    pub server: ServerConfig,
    pub user: UserConfig,
}

impl Config {
    pub fn new() -> Self {
        Config {
            server: ServerConfig::default(),
            user: UserConfig::default(),
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
}

impl Default for UserConfig {
    fn default() -> Self {
        Self {
            nickname: get("USER_NICKNAME"),
            username: get("USER_USERNAME"),
            realname: get("USER_REALNAME"),
        }
    }
}

fn get(key: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| panic!("environment variable '{}' is missing", key))
}
