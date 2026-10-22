package ticket

import "errors"

var (
	ErrNotFound     = errors.New("ticket: not found")
	ErrInvalidInput = errors.New("ticket: invalid input")
	ErrForbidden    = errors.New("ticket: access denied")
)
