package client

import (
	"strings"
)

type RawMessage struct {
	Prefix  string
	Command string
	Params  []string
	Text    string
}

func parseRawMessage(s string) RawMessage {
	var (
		message = strings.Split(strings.TrimSpace(s), " ")
		prefix  string
		command string
		params  []string
		text    string
	)

	if strings.HasPrefix(message[0], ":") {
		prefix = extractPrefix(&message)
	}

	command = extractCommand(&message)

	for i, token := range message {
		if strings.HasPrefix(token, ":") {
			text = strings.Join(message[i:], " ")[1:]
			break
		}

		params = append(params, token)
	}

	return RawMessage{prefix, command, params, text}
}

func extractPrefix(message *[]string) string {
	prefix := (*message)[0]
	*message = (*message)[1:]

	return prefix
}

func extractCommand(message *[]string) string {
	command := (*message)[0]
	*message = (*message)[1:]

	return command
}
