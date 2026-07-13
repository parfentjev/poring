use std::{collections::VecDeque, str::FromStr};

use anyhow::{Context, anyhow};

#[derive(Debug)]
pub(super) struct RawMessage {
    source: String,
    prefix: Option<String>,
    command: String,
    params: Vec<String>,
    text: Option<String>,
}

impl RawMessage {
    pub(super) fn command(&self) -> &str {
        &self.command
    }
}

impl FromStr for RawMessage {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let mut tokens = s.split_whitespace().collect::<VecDeque<_>>();

        let prefix = match tokens.front() {
            Some(token) if token.starts_with(':') => {
                let prefix = token[1..].to_string();
                tokens.pop_front();
                Some(prefix)
            }
            _ => None,
        };

        // An empty message? something is wrong - return.
        let command = tokens
            .pop_front()
            .with_context(|| anyhow!("command is missing in: {s}"))?;

        // Otherwise, some params and possibly text are expected.
        let (params, text) =
            if let Some(text_begins) = tokens.iter().position(|token| token.starts_with(':')) {
                // Save all tokens up do the `:` char as message params.
                let params = tokens
                    .iter()
                    .take(text_begins)
                    .map(|token| token.to_string())
                    .collect();

                // Then save all tokens after the `:` char as message text.
                // It's possible that some servers don't add `:` if it's a single-word message,
                // Might need to address that if it ever becomes a problem. Libera doesn't do that.
                let mut text = String::new();
                for (i, token) in tokens.range(text_begins..).enumerate() {
                    // Need to strip that `:` at the front.
                    if i == 0 {
                        text.push_str(&token[1..]);
                        continue;
                    }

                    text.push(' ');
                    text.push_str(token);
                }

                (params, Some(text))
            } else {
                let params = tokens.iter().map(|token| token.to_string()).collect();

                (params, None)
            };

        Ok(RawMessage {
            source: s.to_owned(),
            prefix,
            command: command.to_string(),
            params,
            text,
        })
    }
}

pub struct Cap {
    target: String,
    subcommand: String,
    capabilities: String,
}

impl Cap {
    pub fn target(&self) -> &str {
        &self.target
    }

    pub fn subcommand(&self) -> &str {
        &self.subcommand
    }

    pub fn capabilities(&self) -> &str {
        &self.capabilities
    }
}

impl TryFrom<RawMessage> for Cap {
    type Error = anyhow::Error;

    fn try_from(value: RawMessage) -> Result<Self, Self::Error> {
        let RawMessage {
            source,
            command,
            params,
            text,
            ..
        } = value;

        if command != "CAP" {
            return Err(anyhow!("expected CAP command in: {source}"));
        }

        let mut params = params.into_iter();

        let target = params
            .next()
            .with_context(|| format!("missing CAP target in: {source}"))?;

        let subcommand = params
            .next()
            .with_context(|| format!("missing CAP subcommand in: {source}"))?;

        let capabilities =
            text.with_context(|| format!("missing CAP capabilities in: {source}"))?;

        Ok(Cap {
            target,
            subcommand,
            capabilities,
        })
    }
}

pub struct Authenticate {
    data: String,
}

impl Authenticate {
    pub fn data(&self) -> &str {
        &self.data
    }
}

impl TryFrom<RawMessage> for Authenticate {
    type Error = anyhow::Error;

    fn try_from(value: RawMessage) -> Result<Self, Self::Error> {
        let RawMessage {
            source,
            command,
            params,
            ..
        } = value;

        if command != "AUTHENTICATE" {
            return Err(anyhow!("expected AUTHENTICATE command in: {source}"));
        }

        let data = params
            .into_iter()
            .next()
            .with_context(|| format!("missing AUTHENTICATE data in: {source}"))?;

        Ok(Authenticate { data })
    }
}

pub struct SaslSuccess {
    target: String,
    text: String,
}

impl SaslSuccess {
    pub fn target(&self) -> &str {
        &self.target
    }

    pub fn text(&self) -> &str {
        &self.text
    }
}

impl TryFrom<RawMessage> for SaslSuccess {
    type Error = anyhow::Error;

    fn try_from(value: RawMessage) -> Result<Self, Self::Error> {
        let RawMessage {
            source,
            command,
            params,
            text,
            ..
        } = value;

        if command != "903" {
            return Err(anyhow!("expected 903 command in: {source}"));
        }

        let target = params
            .into_iter()
            .next()
            .with_context(|| format!("missing 903 target in: {source}"))?;

        let text = text.with_context(|| format!("missing 903 text in: {source}"))?;

        Ok(SaslSuccess { target, text })
    }
}

pub struct Welcome {
    // There are some props, but I don't use them.
    // Props: nickname, text.
}

impl TryFrom<RawMessage> for Welcome {
    type Error = anyhow::Error;

    fn try_from(value: RawMessage) -> Result<Self, Self::Error> {
        let RawMessage {
            source, command, ..
        } = value;

        if command != "001" {
            return Err(anyhow!("expected 001 command in: {source}"));
        }

        Ok(Welcome {})
    }
}

pub struct Ping {
    token: String,
}

impl Ping {
    pub fn token(&self) -> &str {
        &self.token
    }
}

impl TryFrom<RawMessage> for Ping {
    type Error = anyhow::Error;

    fn try_from(value: RawMessage) -> Result<Self, Self::Error> {
        let RawMessage {
            source,
            command,
            text,
            ..
        } = value;

        if command != "PING" {
            return Err(anyhow!("expected PING in: {source}"));
        }

        // Rumors say some servers send token in params, but Libera doesn't do that.
        // I'll keep relying on text until it becomes a problem.
        let token = text.with_context(|| format!("missing PING token in: {source}"))?;

        Ok(Ping { token })
    }
}

pub struct PrivateMessage {
    sender: String,
    receiver: String,
    text: String,
}

impl PrivateMessage {
    pub fn sender(&self) -> &str {
        &self.sender
    }

    pub fn receiver(&self) -> &str {
        &self.receiver
    }

    pub fn text(&self) -> &str {
        &self.text
    }
}

impl TryFrom<RawMessage> for PrivateMessage {
    type Error = anyhow::Error;

    fn try_from(value: RawMessage) -> Result<Self, Self::Error> {
        let RawMessage {
            source,
            prefix,
            command,
            params,
            text,
        } = value;

        if command != "PRIVMSG" {
            return Err(anyhow!("expected PRIVMSG command in: {source}"));
        }

        let sender = prefix.with_context(|| format!("missing PRIVMSG prefix in: {source}"))?;

        let receiver = params
            .into_iter()
            .next()
            .with_context(|| format!("missing PRIVMSG receiver in: {source}"))?;

        let text = text.with_context(|| format!("missing PRIVMSG text in: {source}"))?;

        Ok(PrivateMessage {
            sender,
            receiver,
            text,
        })
    }
}
