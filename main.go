package main

import (
	"fmt"
	"os"

	"codeberg.org/parfentjev/poring/internal/client"
	"codeberg.org/parfentjev/poring/internal/config"
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

	client := client.New(config)
	if err := client.Run(); err != nil {
		fmt.Println("client error:", err)
	}

	return nil
}
