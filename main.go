package main

import (
	"log/slog"
	"os"

	"codeberg.org/parfentjev/poring/internal/client"
	"codeberg.org/parfentjev/poring/internal/config"
	"codeberg.org/parfentjev/poring/internal/event"
	"codeberg.org/parfentjev/poring/internal/handler"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))
	if err := run(logger); err != nil {
		logger.Error("client stopped", "error", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	config, err := config.New()
	if err != nil {
		return err
	}

	eventManager := event.NewManager(logger)
	handler.RegisterHandlers(eventManager)

	return client.New(logger, config, eventManager).Run()
}
