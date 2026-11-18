package task

import "errors"

var (
	ErrNotFound          = errors.New("task: not found")
	ErrInvalidInput      = errors.New("task: invalid input")
	ErrInvalidTransition = errors.New("task: invalid status transition")
)
