package irc

import (
	"fmt"
	"strings"
)

type RawMessage struct {
	Source  string
	Prefix  string
	Command string
	Params  []string
	Text    string
}

func ParseMessage(source string) (RawMessage, error) {
	tokens := strings.Fields(source)
	if len(tokens) == 0 {
		return RawMessage{}, fmt.Errorf("command missing in: %s", source)
	}

	raw := RawMessage{Source: source}
	if strings.HasPrefix(tokens[0], ":") {
		raw.Prefix = strings.TrimPrefix(tokens[0], ":")
		tokens = tokens[1:]
	}

	if len(tokens) == 0 {
		return RawMessage{}, fmt.Errorf("command missing in: %s", source)
	}
	raw.Command = tokens[0]
	tokens = tokens[1:]

	for i, token := range tokens {
		if strings.HasPrefix(token, ":") {
			raw.Params = append(raw.Params, tokens[:i]...)
			raw.Text = strings.TrimPrefix(strings.Join(tokens[i:], " "), ":")

			return raw, nil
		}
	}

	raw.Params = append(raw.Params, tokens...)
	return raw, nil
}
