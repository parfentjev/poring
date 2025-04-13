package handler

import (
	"codeberg.org/parfentjev/godrop/internal/godrop"
)

func handleNext(s *godrop.ScheduleContext) {
	s.Sendf("PRIVMSG %v :!n", s.Config.Handler.Next.Channel)
}
