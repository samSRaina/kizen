package auth

import "errors"

var (
	ErrMissingToken = errors.New("auth: missing token")

	ErrInvalidToken = errors.New("auth: invalid token")

	ErrExpiredToken = errors.New("auth: expired token")

	ErrUnauthenticated = errors.New("auth: unauthenticated user")
)
