package client

import "codeberg.org/parfentjev/poring/internal/config"

type MessageSender func(string)

type ClientContext struct {
	Config config.Config
	Send   MessageSender
}

type ClientConnected struct{}

type ClientDisconnected struct{}
