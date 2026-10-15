package middleware

import (
	"context"

	"github.com/samSRaina/kizen/internal/domain/auth"
)

type contextKey struct{}

var identityContextKey = contextKey{}

// WithIdentity injects an authenticated Identity into the standard context.
func WithIdentity(ctx context.Context, id *auth.Identity) context.Context {
	return context.WithValue(ctx, identityContextKey, id)
}

// FromContext retrieves the Identity from the context, if present.
func FromContext(ctx context.Context) (*auth.Identity, bool) {
	id, ok := ctx.Value(identityContextKey).(*auth.Identity)
	return id, ok && id != nil
}
