package middleware

import (
	"net/http"
	"strings"

	"github.com/samSRaina/kizen/internal/domain/auth"
)

// BearerExtractor extracts bearer credentials from the HTTP Authorization header.
type BearerExtractor struct{}

func NewBearerExtractor() *BearerExtractor {
	return &BearerExtractor{}
}

// Extract parses the Authorization header and validates the "Bearer <token>" format.
func (b *BearerExtractor) Extract(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", auth.ErrMissingToken
	}

	parts := strings.Fields(authHeader)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
		return "", auth.ErrInvalidToken
	}

	token := strings.TrimSpace(parts[1])
	if token == "" {
		return "", auth.ErrInvalidToken
	}

	return token, nil
}
