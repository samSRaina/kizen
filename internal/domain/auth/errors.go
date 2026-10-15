package auth

import "errors"

var (
	// ErrMissingToken indicates that no token was found in the request.
	ErrMissingToken = errors.New("authorization token is missing")

	// ErrInvalidToken indicates that the token is malformed or invalid.
	ErrInvalidToken = errors.New("authorization token is invalid")

	// ErrExpiredToken indicates that the token or session has expired.
	ErrExpiredToken = errors.New("authorization token has expired")

	// ErrUnauthenticated indicates that identity verification could not be completed.
	ErrUnauthenticated = errors.New("user is unauthenticated")
)
