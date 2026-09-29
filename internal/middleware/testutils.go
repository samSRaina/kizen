package middleware

import (
	"context"
)

// WithUserID sets the user identifier in the provided context
func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, UserIDKey, userID)
}
