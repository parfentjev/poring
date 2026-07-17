package client

import (
	"bufio"
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"time"

	"codeberg.org/parfentjev/poring/internal/config"
	"codeberg.org/parfentjev/poring/internal/event"
)

type Client struct {
	config       config.Config
	conn         net.Conn
	eventManager *event.EventManager
}

func New(config config.Config, eventManager *event.EventManager) *Client {
	return &Client{config: config, eventManager: eventManager}
}

func (c *Client) Run() error {
	reconnectDelay := 10 * time.Second

	for {
		err := c.run()
		event.Publish(c.eventManager, event.EventContext[ClientContext, ClientDisconnected]{State: ClientContext{Config: c.config, Send: func(s string) { c.send(s) }}})

		if err != nil {
			fmt.Println("irc session error:", err)
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
		conn.Close()
	}()

	event.Publish(c.eventManager, event.EventContext[ClientContext, ClientConnected]{State: ClientContext{Config: c.config, Send: func(s string) { c.send(s) }}})

	scanner := bufio.NewScanner(conn)
	for scanner.Scan() {
		message := scanner.Text()
		fmt.Println("=>", message)
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("tcp reader error: %w", err)
	}

	return nil
}

func (c *Client) send(message string) {
	fmt.Println("<=", message)

	_, err := io.WriteString(c.conn, message+"\r\n")
	if err != nil {
		fmt.Println("send message error:", err)
	}
}
