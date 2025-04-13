package handler

import (
	"codeberg.org/parfentjev/godrop/internal/config"
	"codeberg.org/parfentjev/godrop/internal/godrop"
)

func RegisterHandlers(c *config.Config, g *godrop.GoDrop) {
	g.Handle("PING", handlePing)
	g.Handle("PRIVMSG", handleNextSessionCountdown)
	g.Schedule(c.Handler.Next.Cron, handleNext)
}
