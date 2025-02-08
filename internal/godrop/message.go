package godrop

import "strings"

type IRCMessage struct {
	Prefix  string
	Command string
	Params  []string
	Text    *IRCText
}

type IRCText struct {
	Value string
}

func NewIRCMessage(prefix string, command string, params []string, text string) *IRCMessage {
	return &IRCMessage{prefix, command, params, &IRCText{text}}
}

func (m *IRCMessage) IsChannel() bool {
	if len(m.Params) < 1 {
		return false
	}

	return strings.HasPrefix(m.Params[0], "#")
}

func (t *IRCText) IsCommand(command string) bool {
	return strings.EqualFold(t.Command(), command)
}

func (t *IRCText) Command() string {
	i := strings.Index(t.Value, " ")

	if i == -1 {
		return t.Value
	}

	return t.Value[:i]
}
