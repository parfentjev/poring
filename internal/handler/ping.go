package handler

import (
	"fmt"

	"codeberg.org/parfentjev/godrop/internal/godrop"
)

func handlePing(send godrop.Sender, message *godrop.IRCMessage) {
	send(fmt.Sprintf("PONG :%v", message.Text.Value))
}
