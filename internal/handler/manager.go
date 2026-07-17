package handler

import (
	"codeberg.org/parfentjev/poring/internal/client"
	"codeberg.org/parfentjev/poring/internal/event"
)

func RegisterHandlers(eventManager *event.EventManager) {
	event.Subscribe(eventManager, func(ctx event.EventContext[client.ClientContext, client.ClientConnectedEvent]) error {
		ctx.State.Logger.Info("connected to the server")

		return nil
	})

	event.Subscribe(eventManager, func(ctx event.EventContext[client.ClientContext, client.ClientDisconnectedEvent]) error {
		ctx.State.Logger.Info("disconnected from the server")

		return nil
	})

	event.Subscribe(eventManager, func(ctx event.EventContext[client.ClientContext, client.ClientConnectedEvent]) error {
		cfg := ctx.State.Config
		send := ctx.State.Send

		send("NICK " + cfg.Identity.Nickname)
		send("USER " + cfg.Identity.Username + " 0 * :" + cfg.Identity.Realname)
		send("JOIN " + cfg.Handler.Core.Autojoin)

		return nil
	})

	event.Subscribe(eventManager, func(ctx event.EventContext[client.ClientContext, client.ServerPingEvent]) error {
		ctx.State.Send("PONG :" + ctx.Event.Token)

		return nil
	})
}
