package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/samSRaina/kizen/api/internal/application/ports"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/platform/httpx"
)

type contextKey struct{}

var identityContextKey = contextKey{}

// WithIdentity injects an authenticated Identity into the context.
func WithIdentity(ctx context.Context, id *auth.Identity) context.Context {
	return context.WithValue(ctx, identityContextKey, id)
}

// IdentityFromContext extracts the Identity from the context.
func IdentityFromContext(ctx context.Context) (*auth.Identity, bool) {
	id, ok := ctx.Value(identityContextKey).(*auth.Identity)
	return id, ok && id != nil
}

// Authenticate middleware parses Bearer token and attaches Identity if valid.
func Authenticate(authenticator ports.Authenticator) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				next.ServeHTTP(w, r)
				return
			}

			parts := strings.Fields(authHeader)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
				next.ServeHTTP(w, r)
				return
			}

			token := parts[1]
			identity, err := authenticator.Authenticate(r.Context(), token)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			ctx := WithIdentity(r.Context(), identity)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireAuth blocks requests that lack an Identity in context.
func RequireAuth() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if _, ok := IdentityFromContext(r.Context()); !ok {
				httpx.Unauthorized(w, "authentication credentials are required")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
