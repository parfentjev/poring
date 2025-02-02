package main

import (
	"codeberg.org/parfentjev/godrop/internal/godrop"
	"codeberg.org/parfentjev/godrop/internal/handler"
)

func main() {
	g, err := godrop.New()
	if err != nil {
		panic(err)
	}

	// todo: there should be a better way to do this than manual registration
	g.Handle("PRIVMSG", func(send godrop.Sender, message godrop.IRCMessage) {
		handler.HandleCeeks(send, message)
	})

	g.Run()
}
