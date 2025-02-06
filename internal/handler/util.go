package handler

import (
	"fmt"
	"math/rand"
	"strings"
	"unicode"
)

func prism(s string) string {
	var (
		chars  = []rune(s)
		output []string
		color  = rand.Intn(15)
	)

	for i := range len(chars) {
		if unicode.IsSpace(chars[i]) {
			output = append(output, fmt.Sprintf("%c", chars[i]))
		} else {
			output = append(output, fmt.Sprintf("\x03%.2d%c", color%16, chars[i]))
			color++
		}
	}

	return strings.Join(output, "")
}
