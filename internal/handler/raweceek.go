package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"codeberg.org/parfentjev/godrop/internal/godrop"
)

type countdownResponse struct {
	Session    session     `json:"session"`
	Countdowns []countdown `json:"countdowns"`
}

type session struct {
	Summary   string `json:"summary"`
	Location  string `json:"location"`
	StartTime string `json:"startTime"`
}

type countdown struct {
	Value float32 `json:"value"`
	Unit  string  `json:"unit"`
}

func handleNextSesson(e *godrop.EventContext) {
	if !e.Message.IsChannel() {
		return
	}

	var key string

	switch e.Message.Text.Command() {
	case "!ceeks":
		key = "ceeks"
	case "!supermax":
		key = "super maxes"
	case "!dogs":
		key = "dog years"
	case "!blinks":
		key = "eye blinks"
	default:
		return
	}

	data, err := fetchCountdown()
	if err != nil {
		log.Printf("failed to fetch countdown; %v", err)
		return
	}

	for _, countdown := range data.Countdowns {
		if countdown.Unit == key {
			response := fmt.Sprintf("%s begins in %.2f %s", data.Session.Summary, countdown.Value, countdown.Unit)
			e.Sendf("PRIVMSG %s :%s 🎉", e.Message.Params[0], prism(response))
			break
		}
	}
}

func fetchCountdown() (countdownResponse, error) {
	var data countdownResponse

	resp, err := http.Get("https://raweceek.eu/api/sessions/countdown")
	if err != nil || resp.StatusCode != http.StatusOK {
		return data, err
	}

	defer resp.Body.Close()
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return data, err
	}

	return data, nil
}
