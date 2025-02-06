package godrop

import (
	"bufio"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"log"
	"net"
	"strings"

	"codeberg.org/parfentjev/godrop/internal/config"
)

type GoDrop struct {
	config   *config.Config
	handlers map[string][]IRCMessageHandler
	conn     net.Conn
}

type IRCMessageHandler func(send Sender, message *IRCMessage)

type Sender func(text string)

func New() (*GoDrop, error) {
	config, err := config.New("./data/godrop.yaml")
	if err != nil {
		return &GoDrop{}, err
	}

	return &GoDrop{config: config, handlers: make(map[string][]IRCMessageHandler)}, nil
}

func (g *GoDrop) Run() {
	var err error

	if g.config.Server.Tls {
		g.conn, err = connectTls(g.config.Server.Address)
	} else {
		g.conn, err = connect(g.config.Server.Address)
	}

	if err != nil {
		panic(err)
	}

	fmt.Fprintf(g.conn, "NICK %s\n", g.config.Server.Nickname)
	fmt.Fprintf(g.conn, "USER godrop 0 *: go\n")
	for _, channel := range g.config.Server.Channels {
		fmt.Fprintf(g.conn, "JOIN %s\n", channel)
	}

	g.Handle("PING", func(send Sender, args *IRCMessage) {
		send(fmt.Sprintf("PONG :%v", args.Text))
	})

	g.listen()
	// theoretically
	log.Println("disconnected, eh?")
}

func (g *GoDrop) Handle(command string, handler IRCMessageHandler) {
	g.handlers[command] = append(g.handlers[command], handler)
}

func connect(address string) (net.Conn, error) {
	return net.Dial("tcp", address)
}

func connectTls(address string) (net.Conn, error) {
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
		log.Printf("=> %s\n", input)

		message := parseInput(input)
		for _, handler := range g.handlers[message.Command] {
			handler(func(text string) {
				g.send(text)
			}, message)
		}
	}
}

func (g *GoDrop) send(input string) {
	log.Printf("<= %s", input)
	fmt.Fprintf(g.conn, "%s\n", input)
}
