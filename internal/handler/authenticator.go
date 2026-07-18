package handler

import (
	"bytes"
	"encoding/base64"

	"codeberg.org/parfentjev/poring/internal/client"
	"codeberg.org/parfentjev/poring/internal/event"
	"codeberg.org/parfentjev/poring/internal/irc"
)

func registerAuthenticatorHandlers(eventManager *event.EventManager) {
	event.Subscribe(eventManager, func(ctx event.EventContext[client.EventContext, client.Connected]) error {
		cfg := ctx.State.Config
		send := ctx.State.Send

		if cfg.Identity.Sasl.Enabled {
			send("CAP REQ :sasl")
		} else {
			send("NICK %s", cfg.Identity.Nickname)
			send("USER %s 0 * :%s", cfg.Identity.Username, cfg.Identity.Realname)
		}

		return nil
	})

	event.Subscribe(eventManager, func(ctx event.EventContext[client.EventContext, irc.Cap]) error {
		if ctx.Event.Subcommand == "ACK" {
			ctx.State.Send("AUTHENTICATE PLAIN")
		}

		return nil
	})

	event.Subscribe(eventManager, func(ctx event.EventContext[client.EventContext, irc.Authenticate]) error {
		if ctx.Event.Data == "+" {
			var data bytes.Buffer
			data.WriteString("\x00")
			data.WriteString(ctx.State.Config.Identity.Sasl.Username)
			data.WriteString("\x00")
			data.WriteString(ctx.State.Config.Identity.Sasl.Password)

			ctx.State.Send("AUTHENTICATE %s", base64.StdEncoding.EncodeToString(data.Bytes()))
		}

		return nil
	})

	event.Subscribe(eventManager, func(ctx event.EventContext[client.EventContext, irc.SASLSuccess]) error {
		cfg := ctx.State.Config.Identity
		send := ctx.State.Send

		send("CAP END")
		send("NICK %s", cfg.Nickname)
		send("USER %s 0 * :%s", cfg.Username, cfg.Realname)

		return nil
	})
}
