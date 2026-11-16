package auth

import "context"

type UserID string

// stringer interface
func (u UserID) String() string {
	return string(u)
}

type Principal struct {
	UserID   UserID
	Email    string
	Name     string
	Username string
}

type principalContextKey struct{}

var principalKey = principalContextKey{}

// WithPrincipal injects an authenticated Principal into the context.
func WithPrincipal(ctx context.Context, p *Principal) context.Context {
	return context.WithValue(ctx, principalKey, p)
}

// PrincipalFrom extracts the Principal from the context.
func PrincipalFrom(ctx context.Context) (*Principal, bool) {
	p, ok := ctx.Value(principalKey).(*Principal)
	return p, ok && p != nil
}

// UserIDFrom extracts the UserID from the context Principal.
func UserIDFrom(ctx context.Context) (UserID, bool) {
	if p, ok := PrincipalFrom(ctx); ok && p.UserID != "" {
		return p.UserID, true
	}
	return "", false
}

// MustUserIDFrom extracts the UserID from context or returns ErrUnauthenticated.
func MustUserIDFrom(ctx context.Context) (UserID, error) {
	uid, ok := UserIDFrom(ctx)
	if !ok {
		return "", ErrUnauthenticated
	}
	return uid, nil
}
