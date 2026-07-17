package client

import (
	"bufio"
	"crypto/tls"
	"fmt"
	"io"
	"log/slog"
	"net"
	"time"

	"codeberg.org/parfentjev/poring/internal/config"
	"codeberg.org/parfentjev/poring/internal/event"
)

type Client struct {
	logger       *slog.Logger
	config       config.Config
	eventManager *event.EventManager
	conn         net.Conn
}

func New(logger *slog.Logger, config config.Config, eventManager *event.EventManager) *Client {
	return &Client{logger: logger.With("component", "client"), config: config, eventManager: eventManager}
}

func (c *Client) Run() error {
	reconnectDelay := 10 * time.Second

	for {
		err := c.run()
		event.Publish(c.eventManager, eventContext(c, ClientDisconnectedEvent{}))

		if err != nil {
			c.logger.Warn("connection terminated", "error", err)
			time.Sleep(reconnectDelay)
		}
	}
}

func (c *Client) run() error {
	conn, err := tls.Dial("tcp", c.config.Server.Address, &tls.Config{})
	if err != nil {
		return fmt.Errorf("tcp dial error: %w", err)
	}

	c.conn = conn
	defer func() {
		c.conn = nil
		_ = conn.Close()
	}()

	event.Publish(c.eventManager, eventContext(c, ClientConnectedEvent{}))

	scanner := bufio.NewScanner(conn)
	for scanner.Scan() {
		message := scanner.Text()
		c.logger.Debug("inbound message", "text", message)

		raw := parseRawMessage(message)
		if raw.Command == "PING" {
			event.Publish(c.eventManager, eventContext(c, ServerPingEvent{Token: raw.Text}))
		}
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("tcp reader error: %w", err)
	}

	return err
}

func (c *Client) send(message string) {
	c.logger.Debug("outbound message", "text", message)

	_, err := io.WriteString(c.conn, message+"\r\n")
	if err != nil {
		c.logger.Warn("failed to send message", "error", err)
	}
}

func eventContext[T any](c *Client, message T) event.EventContext[ClientContext, T] {
	return event.EventContext[ClientContext, T]{
		State: ClientContext{
			Logger: c.logger.With("component", "handler"),
			Config: c.config,
			Send:   func(s string) { c.send(s) },
		},
		Event: message,
	}
}
