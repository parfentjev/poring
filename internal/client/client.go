package client

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"time"

	"codeberg.org/parfentjev/poring/internal/config"
	"codeberg.org/parfentjev/poring/internal/event"
)

type Client struct {
	ctx          context.Context
	logger       *slog.Logger
	config       config.Config
	eventManager *event.EventManager
}

func New(ctx context.Context, logger *slog.Logger, config config.Config, eventManager *event.EventManager) *Client {
	return &Client{
		ctx:          ctx,
		logger:       logger.With("component", "client"),
		config:       config,
		eventManager: eventManager,
	}
}

func (c *Client) Run() error {
	reconnectDelay := 10 * time.Second

	for {
		err := c.run()
		publish(c, nil, Disconnected{})
		if err != nil {
			c.logger.Warn("connection terminated", "error", err)
		}

		timer := time.NewTimer(reconnectDelay)
		select {
		case <-c.ctx.Done():
			timer.Stop()
			return nil
		case <-timer.C:
			continue
		}
	}
}

func (c *Client) run() error {
	conn, err := tls.Dial("tcp", c.config.Server.Address, &tls.Config{})
	if err != nil {
		return fmt.Errorf("tcp dial error: %w", err)
	}

	session := newSession(c.logger, conn)
	defer func() {
		err := session.Close()
		if err != nil {
			c.logger.Warn("failed to close tcp connection", "error", err)
		}
	}()

	stopShutdownHandler := context.AfterFunc(c.ctx, session.Shutdown)
	defer stopShutdownHandler()

	publish(c, session, Connected{})
	return c.readMessages(session)
}

func (c *Client) readMessages(s session) error {
	for {
		message, err := s.ReadMessage()
		if err != nil {
			if errors.Is(err, io.EOF) {
				return nil
			}

			return fmt.Errorf("read message error: %w", err)
		}

		c.logger.Debug("inbound message", "text", message)
		if err := routeIRCEvent(c, s, message); err != nil {
			c.logger.Warn("failed to route irc message", "error", err)
		}
	}
}
