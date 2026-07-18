package client

import (
	"log/slog"

	"codeberg.org/parfentjev/poring/internal/config"
)

type MessageSender func(string, ...any)

type EventContext struct {
	Logger *slog.Logger
	Config config.Config
	Send   MessageSender
}

type Connected struct{}

type Disconnected struct{}
