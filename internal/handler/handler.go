package handler

import "codeberg.org/parfentjev/godrop/internal/godrop"

func RegisterHandlers(g *godrop.GoDrop) {
	g.Handle("PING", handlePing)
	g.Handle("PRIVMSG", handleNextSessionCountdown)
}
