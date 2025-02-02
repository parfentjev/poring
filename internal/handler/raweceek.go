package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"codeberg.org/parfentjev/godrop/internal/godrop"
)

type session struct {
	Summary   string `json:"summary"`
	Location  string `json:"location"`
	StartTime string `json:"startTime"`
}

const WEEK_SECONDS float64 = 604800

func HandleCeeks(send godrop.Sender, message godrop.IRCMessage) {
	if message.Text != "!ceeks" {
		return
	}

	session, err := fetchNextSession()
	if err != nil {
		log.Printf("failed to fetch next session; %v", err)
		return
	}

	ceeks, err := calculateCeeks(session)
	if err != nil {
		log.Printf("failed to calculate ceeks; %v", err)
		return
	}

	// todo: message.Params[0] == bot in case of private messages, need to address that
	// https://todo.fpt.local/tasks/6
	send(fmt.Sprintf("PRIVMSG %s :%s begins in %.2f ceeks", message.Params[0], session.Summary, ceeks))
}

func fetchNextSession() (session, error) {
	var session session

	resp, err := http.Get("https://raweceek.eu/api/sessions/next")
	if err != nil || resp.StatusCode != http.StatusOK {
		return session, err
	}

	defer resp.Body.Close()
	if err := json.NewDecoder(resp.Body).Decode(&session); err != nil {
		return session, err
	}

	return session, nil
}

func calculateCeeks(session session) (float64, error) {
	startTime, err := time.Parse("2006-01-02T15:04Z", session.StartTime)
	if err != nil {
		return 0, err
	}

	return (float64(startTime.Unix()) - float64(time.Now().Unix())) / WEEK_SECONDS, nil
}
