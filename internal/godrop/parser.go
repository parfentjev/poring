package godrop

import (
	"strings"
)

func parseInput(input string) IRCMessage {
	var (
		message []string = strings.Split(strings.TrimSpace(input), " ")
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

	return IRCMessage{
		Prefix:  prefix,
		Command: command,
		Params:  params,
		Text:    text,
	}
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
