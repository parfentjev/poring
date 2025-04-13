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
	"github.com/robfig/cron/v3"
)

type GoDrop struct {
	config   *config.Config
	handlers map[string][]EventHandler
	conn     net.Conn
	cron     *cron.Cron
}

type EventContext struct {
	Send    func(s string)
	Sendf   func(s string, a ...any)
	Message *IRCMessage
	Config  *config.Config
}

type ScheduleContext struct {
	Send   func(s string)
	Sendf  func(s string, a ...any)
	Config *config.Config
}

type EventHandler func(e *EventContext)

type ScheduleHandler func(e *ScheduleContext)

func New(config *config.Config) (*GoDrop, error) {
	cron := cron.New()
	cron.Start()

	return &GoDrop{
		config:   config,
		handlers: make(map[string][]EventHandler),
		cron:     cron,
	}, nil
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
		log.Println(input)

		message := parseInput(input)
		for _, handler := range g.handlers[message.Command] {
			handler(&EventContext{Send: g.send, Sendf: g.sendf, Message: message, Config: g.config})
		}
	}
}

func (g *GoDrop) send(s string) {
	g.sendf(s)
}

func (g *GoDrop) sendf(s string, a ...any) {
	fmt.Fprintf(g.conn, s, a...)
	fmt.Fprint(g.conn, "\n")
}

func (g *GoDrop) onConnect() {
	if g.config.Sasl.Enabled {
		authenticate(g)
	}

	g.sendf("NICK %s\n", g.config.Server.Nickname)
	g.send("USER godrop 0 *: go\n")

	for _, channel := range g.config.Server.Channels {
		g.sendf("JOIN %s\n", channel)
	}
}
