package auth

// UserID represents the unique identifier of a user in the system.
type UserID string

// Identity holds the authenticated user's core attributes.
type Identity struct {
	UserID string
	Email  string
}
