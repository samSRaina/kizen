package workspace

import "errors"

var (
	ErrNotFound = errors.New("workspace: not found")

	ErrInvalidInput = errors.New("workspace: invalid input")

	ErrDuplicateName = errors.New("workspace: duplicate name for user")

	ErrForbidden = errors.New("workspace: access denied")
)
