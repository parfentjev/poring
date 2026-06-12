use std::collections::VecDeque;

/*
 * Some fields aren't used by message handlers yet.
 * This isn't a problem that needs to be fixed.
 */
#[allow(unused)]
pub struct RawMessage {
    pub prefix: Option<String>,
    pub command: String,
    pub params: Vec<String>,
    pub text: Option<String>,
}

impl RawMessage {
    fn build(raw_message: &str) -> Option<RawMessage> {
        let mut tokens = raw_message.split_whitespace().collect::<VecDeque<_>>();

        let prefix = match tokens.front() {
            Some(token) if token.starts_with(':') => {
                let prefix = token[1..].to_string();
                tokens.pop_front();
                Some(prefix)
            }
            _ => None,
        };

        // An empty message? something is wrong - return.
        let command = tokens.pop_front()?;

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

        Some(RawMessage {
            prefix,
            command: command.to_string(),
            params,
            text,
        })
    }
}

pub enum Message {
    // todo: CAP, AUTHENTICATE
    Ping {
        token: String,
    },
    PrivateMessage {
        sender: String,
        receiver: String,
        text: String,
    },
    Raw {
        raw: RawMessage,
    },
}

impl Message {
    pub fn build(raw_message: String) -> Option<Self> {
        let raw_message = RawMessage::build(&raw_message)?;

        match raw_message.command.as_str() {
            "PING" => Self::as_ping(raw_message),
            "PRIVMSG" => Self::as_privmsg(raw_message),
            _ => Self::as_unknown(raw_message),
        }
    }

    pub fn command(&self) -> &str {
        match self {
            Self::Ping { .. } => "PING",
            Self::PrivateMessage { .. } => "PRIVMSG",
            Self::Raw { raw } => &raw.command,
        }
    }

    fn as_ping(raw: RawMessage) -> Option<Self> {
        Some(Message::Ping { token: raw.text? })
    }

    fn as_privmsg(raw: RawMessage) -> Option<Self> {
        let sender = raw.prefix?;
        let receiver = raw.params.first()?.to_string();
        let text = raw.text?;

        Some(Message::PrivateMessage {
            sender,
            receiver,
            text,
        })
    }

    fn as_unknown(raw: RawMessage) -> Option<Self> {
        Some(Message::Raw { raw })
    }
}
