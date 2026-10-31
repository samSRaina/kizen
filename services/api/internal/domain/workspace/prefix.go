package workspace

import (
	"strings"
	"unicode"
)

// GeneratePrefix derives a 3-character uppercase alphanumeric prefix from a workspace name.
// If no alphanumeric characters are present, it falls back to "KZ".
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
