package middleware

import (
	"net/http"

	"github.com/samSRaina/kizen/internal/domain/auth"
	"github.com/samSRaina/kizen/internal/platform/httpx"
)

// Authenticate extracts and validates credentials. If missing or invalid, the request
// continues unauthenticated (anonymous), which allows public routes to function.
func Authenticate(extractor auth.TokenExtractor, authenticator auth.Authenticator) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token, err := extractor.Extract(r)
			if err != nil {
				// No token or malformed header: continue as anonymous
				next.ServeHTTP(w, r)
				return
			}

			identity, err := authenticator.Authenticate(r.Context(), token)
			if err != nil {
				// Token expired or invalid: continue as anonymous
				next.ServeHTTP(w, r)
				return
			}

			// Valid token: enrich context with Identity
			ctx := WithIdentity(r.Context(), identity)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireAuth blocks any request that does not have a verified Identity in context.
func RequireAuth() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if _, ok := FromContext(r.Context()); !ok {
				httpx.Unauthorized(w, "Authentication credentials are required to access this resource")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
