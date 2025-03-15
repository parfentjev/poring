package godrop

import (
	"bufio"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"log"
	"net"
	"strings"
	"time"

	"codeberg.org/parfentjev/godrop/internal/config"
)

type GoDrop struct {
	config   *config.Config
	handlers map[string][]EventHandler
	conn     net.Conn
}

type EventContext struct {
	Send    func(s string)
	Sendf   func(s string, a ...any)
	Message *IRCMessage
	Config  *config.Config
}

type EventHandler func(e *EventContext)

func New() (*GoDrop, error) {
	config, err := config.New("./data/godrop.yaml")
	if err != nil {
		return &GoDrop{}, err
	}

	return &GoDrop{config: config, handlers: make(map[string][]EventHandler)}, nil
}

func (g *GoDrop) Run() {
	var err error

	for {
		g.conn, err = connect(g.config.Server.Address, g.config.Server.Tls)

		if err != nil {
			log.Println("failed to connect to the server", err)
			time.Sleep(10 * time.Second)
			continue
		}

		g.onConnect()
		g.listen()
	}
}

func (g *GoDrop) Handle(command string, handler EventHandler) {
	g.handlers[command] = append(g.handlers[command], handler)
}

func connect(address string, useTls bool) (net.Conn, error) {
	if !useTls {
		return net.Dial("tcp", address)
	}

	rootCAs, err := x509.SystemCertPool()
	if err != nil {
		return nil, err
	}

	conn, err := tls.Dial("tcp", address, &tls.Config{
		RootCAs:            rootCAs,
		InsecureSkipVerify: false,
	})
	if err != nil {
		return nil, err
	}

	return conn, nil
}

func (g *GoDrop) listen() {
	scanner := bufio.NewScanner(g.conn)

	for scanner.Scan() {
		input := strings.TrimRight(scanner.Text(), "\r\n")
		log.Printf("%s\n", input)

		message := parseInput(input)
		for _, handler := range g.handlers[message.Command] {
			handler(&EventContext{Send: g.send, Sendf: g.sendf, Message: message, Config: g.config})
		}
	}
}

func (g *GoDrop) send(s string) {
	fmt.Fprint(g.conn, s)
	fmt.Fprint(g.conn, "\n")
}

func (g *GoDrop) sendf(s string, a ...any) {
	fmt.Fprintf(g.conn, s, a...)
	fmt.Fprint(g.conn, "\n")
}

func (g *GoDrop) onConnect() {
	if g.config.Sasl.Enabled {
		authenticate(g)
	}

	fmt.Fprintf(g.conn, "NICK %s\n", g.config.Server.Nickname)
	fmt.Fprintf(g.conn, "USER godrop 0 *: go\n")

	for _, channel := range g.config.Server.Channels {
		fmt.Fprintf(g.conn, "JOIN %s\n", channel)
	}
}
