package main

import (
	"codeberg.org/parfentjev/godrop/internal/config"
	"codeberg.org/parfentjev/godrop/internal/godrop"
	"codeberg.org/parfentjev/godrop/internal/handler"
)

func main() {
	config, err := config.New("./data/godrop.yaml")
	if err != nil {
		panic(err)
	}

	godrop, err := godrop.New(config)
	if err != nil {
		panic(err)
	}

	handler.RegisterHandlers(config, godrop)
	godrop.Run()
}
