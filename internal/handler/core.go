package handler

import (
	"fmt"
	"strings"

	"codeberg.org/parfentjev/poring/internal/client"
	"codeberg.org/parfentjev/poring/internal/event"
	"codeberg.org/parfentjev/poring/internal/irc"
	"codeberg.org/parfentjev/poring/internal/metadata"
)

func registerCoreHandlers(eventManager *event.EventManager) {
	event.Subscribe(eventManager, func(ctx event.EventContext[client.EventContext, client.Connected]) error {
		ctx.State.Logger.Info("connected to the server")

		return nil
	})

	event.Subscribe(eventManager, func(ctx event.EventContext[client.EventContext, client.Disconnected]) error {
		ctx.State.Logger.Info("disconnected from the server")

		return nil
	})

	event.Subscribe(eventManager, func(ctx event.EventContext[client.EventContext, irc.Ping]) error {
		ctx.State.Send("PONG :%s", ctx.Event.Token)

		return nil
	})

	event.Subscribe(eventManager, func(ctx event.EventContext[client.EventContext, irc.Welcome]) error {
		ctx.State.Send("JOIN %s", ctx.State.Config.Handler.Core.Autojoin)

		return nil
	})

	event.Subscribe(eventManager, func(ctx event.EventContext[client.EventContext, irc.PrivateMessage]) error {
		if ctx.Event.Text == "\x01VERSION\x01" {
			sender, _, ok := strings.Cut(ctx.Event.Sender, "!")
			if !ok {
				return fmt.Errorf("invalid VERSION request sender: %s", ctx.Event.Sender)
			}

			ctx.State.Send("NOTICE %s :\x01VERSION %s\x01", sender, metadata.Version)
		}

		return nil
	})
}
