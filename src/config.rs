pub struct Config {
    pub server: String,
    pub nickname: String,
    pub channels: Vec<String>,
}

impl Config {
    pub fn new() -> Self {
        Config {
            server: Self::get("IRC_SERVER"),
            nickname: Self::get("IRC_NICKNAME"),
            channels: vec![Self::get("IRC_CHANNELS").split(',').collect()],
        }
    }

    fn get(key: &str) -> String {
        std::env::var(key).unwrap_or_else(|_| panic!("environment variable '{}' is missing", key))
    }
}
