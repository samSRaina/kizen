package ticket

import "errors"

var (
	ErrNotFound          = errors.New("ticket: not found")
	ErrInvalidInput      = errors.New("ticket: invalid input")
	ErrInvalidTransition = errors.New("ticket: invalid status transition")
	ErrForbidden         = errors.New("ticket: access denied")
)
