package handler

import (
	"codeberg.org/parfentjev/poring/internal/client"
	"codeberg.org/parfentjev/poring/internal/event"
	"codeberg.org/parfentjev/poring/internal/irc"
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
}
