package handler

import (
	"fmt"
	"math/rand"
	"strings"
	"unicode"
)

func prism(text string) string {
	var (
		output strings.Builder
		color  = rand.Intn(16)
	)

	for _, char := range text {
		if !unicode.IsSpace(char) {
			fmt.Fprintf(&output, "\x03%.2d", color%16)
			color++
		}

		output.WriteRune(char)
	}

	return output.String()
}
