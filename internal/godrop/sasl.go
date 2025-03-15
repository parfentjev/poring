package godrop

// https://ircv3.net/specs/extensions/sasl-3.1.html#example-protocol-exchange

import (
	"bytes"
	"encoding/base64"
	"time"
)

const (
	saslIdle = iota
	saslRequested
	saslSentAuthPlain
	saslSentAuthPassword
)

var saslState = saslIdle

func authenticate(g *GoDrop) {
	g.Handle("CAP", handleCap)
	g.Handle("AUTHENTICATE", handleSaslAuth)
	g.Handle("903", handleSaslAuthSuccess)

	saslState = saslRequested
	g.send("CAP REQ :sasl")

	time.AfterFunc(1*time.Minute, func() {
		saslState = saslIdle
	})
}

func handleCap(e *EventContext) {
	if saslState != saslRequested {
		return
	}

	if len(e.Message.Params) == 2 && e.Message.Params[1] == "ACK" && e.Message.Text.Value == "sasl" {
		saslState = saslSentAuthPlain
		e.Send("AUTHENTICATE PLAIN")
	}
}

func handleSaslAuth(e *EventContext) {
	if saslState != saslSentAuthPlain {
		return
	}

	if e.Message.Params[0] == "+" {
		var data bytes.Buffer
		data.WriteString("\x00")
		data.WriteString(e.Config.Sasl.Username)
		data.WriteString("\x00")
		data.WriteString(e.Config.Sasl.Password)

		saslState = saslSentAuthPassword
		e.Sendf("AUTHENTICATE %v", base64.StdEncoding.EncodeToString(data.Bytes()))
	}
}

func handleSaslAuthSuccess(e *EventContext) {
	saslState = saslIdle
	e.Send("CAP END")

	for _, channel := range e.Config.Server.Channels {
		e.Sendf("JOIN %s\n", channel)
	}
}
