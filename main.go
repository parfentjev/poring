package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"codeberg.org/parfentjev/poring/internal/client"
	"codeberg.org/parfentjev/poring/internal/config"
	"codeberg.org/parfentjev/poring/internal/event"
	"codeberg.org/parfentjev/poring/internal/handler"
)

func main() {
	logger := logger()
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

	ctx, cancelCtx := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancelCtx()

	return client.New(ctx, logger, config, eventManager).Run()
}

func logger() *slog.Logger {
	level := slog.LevelInfo
	if value, ok := os.LookupEnv("LOG_LEVEL"); ok {
		_ = level.UnmarshalText([]byte(value))
	}

	return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: level}))
}
