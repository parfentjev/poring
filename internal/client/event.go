package client

import (
	"log/slog"

	"codeberg.org/parfentjev/poring/internal/config"
)

type MessageSender func(string)

type ClientContext struct {
	Logger *slog.Logger
	Config config.Config
	Send   MessageSender
}

type ClientConnectedEvent struct{}

type ClientDisconnectedEvent struct{}

type ServerPingEvent struct {
	Token string
}
