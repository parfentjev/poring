package handler

import (
	"codeberg.org/parfentjev/poring/internal/client"
	"codeberg.org/parfentjev/poring/internal/event"
)

func RegisterHandlers(eventManager *event.EventManager) {
	event.Subscribe(eventManager, func(ctx event.EventContext[client.ClientContext, client.ClientConnected]) {
		ctx.State.Logger.Info("connected to the server")
	})

	event.Subscribe(eventManager, func(ctx event.EventContext[client.ClientContext, client.ClientDisconnected]) {
		ctx.State.Logger.Info("disconnected from the server")
	})

	event.Subscribe(eventManager, func(ctx event.EventContext[client.ClientContext, client.ClientConnected]) {
		cfg := ctx.State.Config
		ctx.State.Send("NICK " + cfg.Identity.Nickname)
		ctx.State.Send("USER " + cfg.Identity.Username + " 0 * :" + cfg.Identity.Realname)
		ctx.State.Send("JOIN " + cfg.Handler.Core.Autojoin)
	})
}
