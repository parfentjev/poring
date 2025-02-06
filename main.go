package main

import (
	"codeberg.org/parfentjev/godrop/internal/godrop"
	"codeberg.org/parfentjev/godrop/internal/handler"
)

func main() {
	godrop, err := godrop.New()
	if err != nil {
		panic(err)
	}

	handler.RegisterHandlers(godrop)
	godrop.Run()
}
