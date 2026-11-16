package project

import (
	"strings"
	"unicode"
)

// GeneratePrefix derives a 3-character uppercase alphanumeric prefix from a project name.
func GeneratePrefix(name string) string {
	var b strings.Builder
	for _, r := range name {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			b.WriteRune(unicode.ToUpper(r))
			if b.Len() == 3 {
				break
			}
		}
	}

	if b.Len() == 0 {
		return "KZ"
	}

	return b.String()
}
