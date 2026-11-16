package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/transport/http/httpx"
)

// WithPrincipal injects an authenticated Principal into the context.
func WithPrincipal(ctx context.Context, p *auth.Principal) context.Context {
	return auth.WithPrincipal(ctx, p)
}

// PrincipalFromContext extracts the Principal from the context.
func PrincipalFromContext(ctx context.Context) (*auth.Principal, bool) {
	return auth.PrincipalFrom(ctx)
}

// Authenticate returns middleware that validates JWT Bearer tokens and puts caller principal on context.
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

			principal, err := authProvider.Authenticate(r.Context(), rawToken)
			if err != nil {
				httpx.Problem(w, http.StatusUnauthorized, "Unauthorized", "Invalid or expired token")
				return
			}

			ctx := auth.WithPrincipal(r.Context(), principal)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
