package client

import (
	"fmt"

	"codeberg.org/parfentjev/poring/internal/event"
	"codeberg.org/parfentjev/poring/internal/irc"
)

func routeIRCEvent(c *Client, s string) error {
	raw, err := irc.ParseMessage(s)
	if err != nil {
		return fmt.Errorf("failed to parse irc message: %w", err)
	}

	switch raw.Command {
	case "PRIVMSG":
		return constructAndPublish(c, raw, irc.NewPrivateMessage)
	case "PING":
		return constructAndPublish(c, raw, irc.NewPing)
	case "CAP":
		return constructAndPublish(c, raw, irc.NewCap)
	case "AUTHENTICATE":
		return constructAndPublish(c, raw, irc.NewAuthenticate)
	case "903":
		return constructAndPublish(c, raw, irc.NewSASLSuccess)
	case "001":
		return constructAndPublish(c, raw, irc.NewWelcome)
	default:
		return nil
	}
}

func constructAndPublish[T any](c *Client, raw irc.RawMessage, constructor func(irc.RawMessage) (T, error)) error {
	message, err := constructor(raw)
	if err != nil {
		return fmt.Errorf("construct %s event: %w", raw.Command, err)
	}

	publish(c, message)
	return nil
}

func publish[T any](c *Client, message T) {
	event.Publish(c.eventManager, event.EventContext[EventContext, T]{
		State: EventContext{
			Logger: c.logger.With("component", "handler"),
			Config: c.config,
			Send:   c.send,
		},
		Event: message,
	})
}
