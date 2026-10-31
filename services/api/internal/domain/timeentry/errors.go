package timeentry

import "errors"

var (
	ErrNotFound       = errors.New("timeentry: not found")
	ErrInvalidInput   = errors.New("timeentry: invalid input")
	ErrAlreadyStopped = errors.New("timeentry: timer is already stopped")
)
