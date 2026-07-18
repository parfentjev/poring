package irc

import "fmt"

func NewPrivateMessage(raw RawMessage) (PrivateMessage, error) {
	if err := expectCommand(raw, "PRIVMSG"); err != nil {
		return PrivateMessage{}, err
	}

	sender, err := requirePrefix(raw, "PRIVMSG prefix")
	if err != nil {
		return PrivateMessage{}, err
	}
	receiver, err := requireParam(raw, 0, "PRIVMSG receiver")
	if err != nil {
		return PrivateMessage{}, err
	}
	text, err := requireText(raw, "PRIVMSG text")
	if err != nil {
		return PrivateMessage{}, err
	}

	return PrivateMessage{Sender: sender, Receiver: receiver, Text: text}, nil
}

type Ping struct {
	Token string
}

func NewPing(raw RawMessage) (Ping, error) {
	if err := expectCommand(raw, "PING"); err != nil {
		return Ping{}, err
	}

	token, err := requireText(raw, "PING token")
	if err != nil {
		return Ping{}, err
	}

	return Ping{Token: token}, nil
}

type PrivateMessage struct {
	Sender   string
	Receiver string
	Text     string
}

type Cap struct {
	Target       string
	Subcommand   string
	Capabilities string
}

func NewCap(raw RawMessage) (Cap, error) {
	if err := expectCommand(raw, "CAP"); err != nil {
		return Cap{}, err
	}

	target, err := requireParam(raw, 0, "CAP target")
	if err != nil {
		return Cap{}, err
	}
	subcommand, err := requireParam(raw, 1, "CAP subcommand")
	if err != nil {
		return Cap{}, err
	}
	capabilities, err := requireText(raw, "CAP capabilities")
	if err != nil {
		return Cap{}, err
	}

	return Cap{Target: target, Subcommand: subcommand, Capabilities: capabilities}, nil
}

type Authenticate struct {
	Data string
}

func NewAuthenticate(raw RawMessage) (Authenticate, error) {
	if err := expectCommand(raw, "AUTHENTICATE"); err != nil {
		return Authenticate{}, err
	}

	data, err := requireParam(raw, 0, "AUTHENTICATE data")
	if err != nil {
		return Authenticate{}, err
	}

	return Authenticate{Data: data}, nil
}

type SASLSuccess struct {
	Target string
	Text   string
}

func NewSASLSuccess(raw RawMessage) (SASLSuccess, error) {
	if err := expectCommand(raw, "903"); err != nil {
		return SASLSuccess{}, err
	}

	target, err := requireParam(raw, 0, "903 target")
	if err != nil {
		return SASLSuccess{}, err
	}
	text, err := requireText(raw, "903 text")
	if err != nil {
		return SASLSuccess{}, err
	}

	return SASLSuccess{Target: target, Text: text}, nil
}

type Welcome struct{}

func NewWelcome(raw RawMessage) (Welcome, error) {
	if err := expectCommand(raw, "001"); err != nil {
		return Welcome{}, err
	}

	return Welcome{}, nil
}

func expectCommand(raw RawMessage, command string) error {
	if raw.Command != command {
		return fmt.Errorf("expected %s command in: %s", command, raw.Source)
	}

	return nil
}

func requirePrefix(raw RawMessage, name string) (string, error) {
	if raw.Prefix == "" {
		return "", fmt.Errorf("missing %s in: %s", name, raw.Source)
	}

	return raw.Prefix, nil
}

func requireParam(raw RawMessage, index int, name string) (string, error) {
	if len(raw.Params) <= index {
		return "", fmt.Errorf("missing %s in: %s", name, raw.Source)
	}

	return raw.Params[index], nil
}

func requireText(raw RawMessage, name string) (string, error) {
	if raw.Text == "" {
		return "", fmt.Errorf("missing %s in: %s", name, raw.Source)
	}

	return raw.Text, nil
}
