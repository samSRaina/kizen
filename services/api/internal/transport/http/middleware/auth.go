package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/transport/http/httpx"
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

// Authenticate returns middleware that validates JWT Bearer tokens and puts caller identity on context.
func Authenticate(authProvider auth.Authenticator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				httpx.Problem(w, http.StatusUnauthorized, "Unauthorized", "Missing authorization header")
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
				httpx.Problem(w, http.StatusUnauthorized, "Unauthorized", "Invalid authorization header format")
				return
			}

			rawToken := strings.TrimSpace(parts[1])
			if rawToken == "" {
				httpx.Problem(w, http.StatusUnauthorized, "Unauthorized", "Token cannot be empty")
				return
			}

			identity, err := authProvider.Authenticate(r.Context(), rawToken)
			if err != nil {
				httpx.Problem(w, http.StatusUnauthorized, "Unauthorized", "Invalid or expired token")
				return
			}

			ctx := WithIdentity(r.Context(), identity)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
