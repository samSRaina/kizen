package ports

import (
	"context"

	"github.com/samSRaina/kizen/api/internal/domain/auth"
)

type Authenticator interface {
	Authenticate(ctx context.Context, token string) (*auth.Identity, error)
}
