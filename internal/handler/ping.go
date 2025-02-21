package handler

import (
	"codeberg.org/parfentjev/godrop/internal/godrop"
)

func handlePing(e *godrop.EventContext) {
	e.Sendf("PONG :%v", e.Message.Text.Value)
}
