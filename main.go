package main

import (
	"fmt"
	"strings"

	"codeberg.org/parfentjev/godrop/internal/godrop"
)

func main() {
	g, err := godrop.New()
	if err != nil {
		panic(err)
	}

	g.Handle("PRIVMSG", func(send godrop.Sender, args godrop.IRCMessage) {
		if args.Params[0] == "#prontera_field" && strings.HasPrefix(args.Text, "!say") {
			send(fmt.Sprintf("PRIVMSG %s :%s", args.Params[0], args.Text[strings.Index(args.Text, " ")+1:]))
		}
	})

	g.Run()
}
