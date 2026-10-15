package auth

import (
	"context"
	"net/http"
)

// TokenExtractor defines how to pull a token/credential string from an HTTP request.
type TokenExtractor interface {
	Extract(r *http.Request) (string, error)
}

// Authenticator verifies a raw token and resolves it into a domain Identity.
type Authenticator interface {
	Authenticate(ctx context.Context, token string) (*Identity, error)
}
