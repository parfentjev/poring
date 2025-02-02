package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"codeberg.org/parfentjev/godrop/internal/godrop"
)

type nextSession struct {
	Summary   string `json:"summary"`
	Location  string `json:"location"`
	StartTime string `json:"startTime"`
}

const WEEK_SECONDS float64 = 604800

func HandleCeeks(send godrop.Sender, message godrop.IRCMessage) {
	if message.Text != "!ceeks" {
		return
	}

	data, err := fetchNextSession()
	if err != nil {
		return
	}

	ceeks, err := calculateCeeks(data)
	if err != nil {
		return
	}

	// todo: message.Params[0] == bot in case of private messages, need to address that
	send(fmt.Sprintf("PRIVMSG %s :%s begins in %.2f ceeks", message.Params[0], data.Summary, ceeks))
}

func fetchNextSession() (nextSession, error) {
	var data nextSession

	resp, err := http.Get("https://raweceek.eu/api/sessions/next")
	if err != nil || resp.StatusCode != http.StatusOK {
		return data, err
	}

	defer resp.Body.Close()
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return data, err
	}

	return data, nil
}

func calculateCeeks(data nextSession) (float64, error) {
	startTime, err := time.Parse("2006-01-02T15:04Z", data.StartTime)
	if err != nil {
		return 0, err
	}

	return (float64(startTime.Unix()) - float64(time.Now().Unix())) / WEEK_SECONDS, nil
}
