package client

import (
	"bufio"
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"time"

	"codeberg.org/parfentjev/poring/internal/config"
)

type Client struct {
	config config.Config
	conn   net.Conn
}

func New(config config.Config) *Client {
	return &Client{config: config}
}

func (c *Client) Run() error {
	reconnectDelay := 10 * time.Second

	for {
		err := c.runClient()
		if err != nil {
			fmt.Println("irc session error:", err)
		}

		fmt.Println("disconnected form the server")
		time.Sleep(reconnectDelay)
	}
}

func (c *Client) runClient() error {
	conn, err := tls.Dial("tcp", c.config.Server.Address, &tls.Config{})
	if err != nil {
		return fmt.Errorf("tcp dial error: %w", err)
	}

	c.conn = conn
	defer func() {
		c.conn = nil
		conn.Close()
	}()

	fmt.Println("connected to the server")
	c.send("NICK " + c.config.Identity.Nickname)
	c.send("USER " + c.config.Identity.Username + " 0 * :" + c.config.Identity.Realname)
	c.send("JOIN " + c.config.Handler.Core.Autojoin)

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
