package jwt

import (
	"context"
	"fmt"
	"time"

	"github.com/jwx-go/jwkfetch/v4"
	"github.com/lestrrat-go/httprc/v3"
	"github.com/lestrrat-go/jwx/v4/jwt"
	"github.com/samSRaina/kizen/api/internal/application/ports"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
)

var _ ports.Authenticator = (*Authenticator)(nil)

type Authenticator struct {
	cache   *jwkfetch.Cache
	jwksURL string
}

func NewAuthenticator(ctx context.Context, jwksURL string) (*Authenticator, error) {
	// 1. Create the background cache client
	client := httprc.NewClient()
	cache, err := jwkfetch.NewCache(ctx, client)
	if err != nil {
		return nil, fmt.Errorf("create jwk cache: %w", err)
	}

	// 2. Register the URL (fetches the public keys immediately so it's ready)
	err = cache.Register(ctx, jwksURL, jwkfetch.WithMinInterval(15*time.Minute))
	if err != nil {
		return nil, fmt.Errorf("register jwks: %w", err)
	}

	return &Authenticator{
		cache:   cache,
		jwksURL: jwksURL,
	}, nil
}

// Authenticate is called on every request
func (a *Authenticator) Authenticate(ctx context.Context, rawToken string) (*auth.Identity, error) {
	if rawToken == "" {
		return nil, auth.ErrMissingToken
	}

	// 1. Get keys from memory (no database or network delay)
	keySet, err := a.cache.Fetch(ctx, a.jwksURL)
	if err != nil {
		return nil, fmt.Errorf("jwks unavailable: %w", err)
	}

	// 2. Verify signature and check expiration
	tok, err := jwt.Parse([]byte(rawToken), jwt.WithKeySet(keySet))
	if err != nil {
		return nil, auth.ErrInvalidToken
	}

	// 3. Read the user ID and email
	sub, _ := tok.Subject()
	email, _ := jwt.Get[string](tok, "email")

	return &auth.Identity{
		UserID: auth.UserID(sub),
		Email:  email,
	}, nil
}
