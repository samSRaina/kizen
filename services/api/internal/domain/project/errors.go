package project

import "errors"

var (
	ErrNotFound = errors.New("project: not found")

	ErrInvalidInput = errors.New("project: invalid input")

	ErrDuplicateName = errors.New("project: duplicate name in workspace")

	ErrForbidden = errors.New("project: access denied")
)
