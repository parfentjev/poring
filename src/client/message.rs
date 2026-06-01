use std::collections::VecDeque;

/*
 * Some fields aren't used by message handlers yet.
 * This isn't a problem that needs to be fixed.
 */
#[allow(unused)]
pub struct Message {
    pub prefix: Option<String>,
    pub command: String,
    pub params: Vec<String>,
    pub text: String,
}

pub fn parse_raw(raw_message: &str) -> Option<Message> {
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
    let params: Vec<String>;
    let mut text = String::new();

    if let Some(text_begins) = tokens.iter().position(|token| token.starts_with(':')) {
        // Save all tokens up do the `:` char as message params.
        params = tokens
            .iter()
            .take(text_begins)
            .map(|token| token.to_string())
            .collect();

        // Then save all tokens after the `:` char as message text.
        for (i, token) in tokens.range(text_begins..).enumerate() {
            // Need to strip that `:` at the front.
            if i == 0 {
                text.push_str(&token[1..]);
                continue;
            }

            text.push(' ');
            text.push_str(token);
        }
    } else {
        params = tokens.iter().map(|token| token.to_string()).collect();
    }

    Some(Message {
        prefix,
        command: command.to_string(),
        params,
        text,
    })
}
