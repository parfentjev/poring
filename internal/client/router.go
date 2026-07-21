package client

import (
	"fmt"

	"codeberg.org/parfentjev/poring/internal/event"
	"codeberg.org/parfentjev/poring/internal/irc"
)

func routeIRCEvent(c *Client, s session, message string) error {
	raw, err := irc.ParseMessage(message)
	if err != nil {
		return fmt.Errorf("failed to parse irc message: %w", err)
	}

	switch raw.Command {
	case "PRIVMSG":
		return constructAndPublish(c, s, raw, irc.NewPrivateMessage)
	case "PING":
		return constructAndPublish(c, s, raw, irc.NewPing)
	case "CAP":
		return constructAndPublish(c, s, raw, irc.NewCap)
	case "AUTHENTICATE":
		return constructAndPublish(c, s, raw, irc.NewAuthenticate)
	case "903":
		return constructAndPublish(c, s, raw, irc.NewSASLSuccess)
	case "001":
		return constructAndPublish(c, s, raw, irc.NewWelcome)
	default:
		return nil
	}
}

func constructAndPublish[T any](c *Client, s session, raw irc.RawMessage, constructor func(irc.RawMessage) (T, error)) error {
	message, err := constructor(raw)
	if err != nil {
		return fmt.Errorf("construct %s event: %w", raw.Command, err)
	}

	publish(c, s, message)
	return nil
}

func publish[T any](c *Client, s session, message T) {
	var send MessageSender
	if s != nil {
		send = s.WriteMessage
	}

	event.Publish(c.eventManager, event.EventContext[EventContext, T]{
		State: EventContext{
			Logger: c.logger.With("component", "handler"),
			Config: c.config,
			Send:   send,
		},
		Event: message,
	})
}
