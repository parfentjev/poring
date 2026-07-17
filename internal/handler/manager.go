package handler

import (
	"fmt"

	"codeberg.org/parfentjev/poring/internal/client"
	"codeberg.org/parfentjev/poring/internal/event"
)

func RegisterHandlers(eventManager *event.EventManager) {
	event.Subscribe(eventManager, func(_ event.EventContext[client.ClientContext, client.ClientConnected]) {
		fmt.Println("connected to the server")
	})

	event.Subscribe(eventManager, func(_ event.EventContext[client.ClientContext, client.ClientDisconnected]) {
		fmt.Println("disconnected from the server")
	})

	event.Subscribe(eventManager, func(ctx event.EventContext[client.ClientContext, client.ClientConnected]) {
		ctx.State.Send("NICK " + ctx.State.Config.Identity.Nickname)
		ctx.State.Send("USER " + ctx.State.Config.Identity.Username + " 0 * :" + ctx.State.Config.Identity.Realname)
		ctx.State.Send("JOIN " + ctx.State.Config.Handler.Core.Autojoin)
	})
}
