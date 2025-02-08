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

const WEEK_SECONDS float64 = 604_800
const SUPER_MAX_SECONDS float64 = 225
const DOG_YEAR_SECONDS float64 = 4_505_142
const BLINK_SECONDS float64 = 0.3

func handleNextSesson(send godrop.Sender, message *godrop.IRCMessage) {
	if !message.IsChannel() {
		return
	}

	var (
		unitSeconds      float64
		responseTemplate string
	)

	switch message.Text.Command() {
	case "!ceeks":
		unitSeconds = WEEK_SECONDS
		responseTemplate = "%s begins in %.2f ceeks"
	case "!supermax":
		unitSeconds = SUPER_MAX_SECONDS
		responseTemplate = "%s begins in %.2f super max songs"
	case "!dogs":
		unitSeconds = DOG_YEAR_SECONDS
		responseTemplate = "%s begins in %.2f dog years"
	case "!blinks":
		unitSeconds = BLINK_SECONDS
		responseTemplate = "%s begins in %e eye blinks"
	default:
		return
	}

	session, err := fetchNextSession()
	if err != nil {
		log.Printf("failed to fetch next session; %v", err)
		return
	}

	units, err := calculateUnits(session, unitSeconds)
	if err != nil {
		log.Printf("failed to calculate units; %v", err)
		return
	}

	response := fmt.Sprintf(responseTemplate, session.Summary, units)
	send(fmt.Sprintf("PRIVMSG %s :%s 🎉", message.Params[0], prism(response)))
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

func calculateUnits(session session, n float64) (float64, error) {
	startTime, err := time.Parse("2006-01-02T15:04Z", session.StartTime)
	if err != nil {
		return 0, err
	}

	return (float64(startTime.Unix()) - float64(time.Now().Unix())) / n, nil
}
