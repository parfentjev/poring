package godrop

import (
	"net"

	"codeberg.org/parfentjev/godrop/internal/config"
)

type GoDrop struct {
	config   config.Config
	handlers map[string][]IRCMessageHandler
	conn     net.Conn
}

type IRCMessageHandler func(send Sender, message IRCMessage)

type IRCMessage struct {
	Prefix  string
	Command string
	Params  []string
	Text    string
}

type Sender func(text string)
