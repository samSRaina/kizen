package workspace_test

import (
	"testing"

	"github.com/samSRaina/kizen/api/internal/domain/workspace"
)

func TestGeneratePrefix(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{name: "Standard two-word name", input: "Acme Corp", expected: "ACM"},
		{name: "Single short word", input: "Go", expected: "GO"},
		{name: "Symbols and numbers", input: "  #12-Project!  ", expected: "12P"},
		{name: "Empty string", input: "", expected: "KZ"},
		{name: "Only punctuation", input: "!@#$%^&*", expected: "KZ"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			actual := workspace.GeneratePrefix(tc.input)
			if actual != tc.expected {
				t.Errorf("GeneratePrefix(%q) = %q, expected %q", tc.input, actual, tc.expected)
			}
		})
	}
}
