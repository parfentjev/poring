package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"codeberg.org/parfentjev/poring/internal/client"
	"codeberg.org/parfentjev/poring/internal/event"
	"codeberg.org/parfentjev/poring/internal/irc"
)

type raweceekNextSession struct {
	Summary    string              `json:"summary"`
	Countdowns []raweceekCountdown `json:"countdowns"`
}

type raweceekCountdown struct {
	Kind  string `json:"type"`
	Value string `json:"value"`
}

func registerRaweceekHandler(eventManger *event.EventManager) {
	event.Subscribe(eventManger, func(ctx event.EventContext[client.EventContext, irc.PrivateMessage]) error {
		if ctx.Event.Text != "!ceeks" || !strings.HasPrefix(ctx.Event.Receiver, "#") {
			return nil
		}

		resp, err := http.Get(ctx.State.Config.Handler.Raweceek.URL)
		if err != nil {
			return fmt.Errorf("failed to call raweceek.eu: %w", err)
		}

		defer func() { _ = resp.Body.Close() }()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("failed to read raweceek.eu response: %w", err)
		}

		var nextSession raweceekNextSession
		if json.Unmarshal(body, &nextSession) != nil {
			return fmt.Errorf("failed to unmarshal raweceek.eu response: %w", err)
		}

		var ceeks string
		for _, countdown := range nextSession.Countdowns {
			if countdown.Kind == "CEEKS" {
				ceeks = countdown.Value
			}
		}

		if nextSession.Summary == "" || ceeks == "" {
			return fmt.Errorf("CEEKS countdown is missing in: %v", nextSession)
		}

		ctx.State.Send("PRIVMSG %s :\x02%s\x02 begins in %s 🎉", ctx.Event.Receiver, nextSession.Summary, ceeks)

		return nil
	})
}
