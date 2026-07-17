package main

import (
	"fmt"
	"os"

	"codeberg.org/parfentjev/poring/internal/client"
	"codeberg.org/parfentjev/poring/internal/config"
	"codeberg.org/parfentjev/poring/internal/event"
	"codeberg.org/parfentjev/poring/internal/handler"
)

func main() {
	if err := run(); err != nil {
		fmt.Println("execution stopped with error:", err)
		os.Exit(1)
	}
}

func run() error {
	config, err := config.New()
	if err != nil {
		return err
	}

	eventManager := event.NewManager()
	handler.RegisterHandlers(eventManager)

	client := client.New(config, eventManager)
	if err := client.Run(); err != nil {
		fmt.Println("client error:", err)
	}

	return nil
}
