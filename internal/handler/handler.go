package handler

import (
	"codeberg.org/parfentjev/godrop/internal/config"
	"codeberg.org/parfentjev/godrop/internal/godrop"
)

func RegisterHandlers(c *config.Config, g *godrop.GoDrop) {
	g.Handle("PING", handlePing)
	g.Handle("PRIVMSG", handleNextSessionCountdown)
	g.CronSchedule(c.Handler.Next.Cron, handleNext)
	g.TimerSchedule(c.Handler.Poring.TimerRangeStart, c.Handler.Poring.TimerRangeEnd, handlePoring)
}
