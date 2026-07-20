package client

import (
	"bufio"
	"crypto/tls"
	"fmt"
	"io"
	"log/slog"
	"net"
	"strings"
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
		publish(c, Disconnected{})
		if err != nil {
			c.logger.Warn("connection terminated", "error", err)
		}

		time.Sleep(reconnectDelay)
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

	publish(c, Connected{})

	scanner := bufio.NewScanner(conn)
	for scanner.Scan() {
		message := scanner.Text()
		c.logger.Debug("inbound message", "text", message)
		if err := routeIRCEvent(c, message); err != nil {
			c.logger.Warn("failed to route irc message", "error", err)
		}
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("tcp reader error: %w", err)
	}

	return err
}

func (c *Client) send(s string, a ...any) {
	message := fmt.Sprintf(s, a...)
	if strings.ContainsAny(message, "\r\n\x00") {
		c.logger.Warn("invalid irc message")
		return
	}

	c.logger.Debug("outbound message", "text", message)
	c.write(message)
	c.write("\r\n")
}

func (c *Client) write(s string) {
	_, err := io.WriteString(c.conn, s)
	if err != nil {
		c.logger.Warn("failed to write to tcp strea", "error", err)
	}
}
