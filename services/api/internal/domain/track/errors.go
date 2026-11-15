package track

import "errors"

var (
	ErrNotFound       = errors.New("timeentry: not found")
	ErrInvalidInput   = errors.New("timeentry: invalid input")
	ErrAlreadyStopped = errors.New("timeentry: timer is already stopped")
	ErrAlreadyRunning = errors.New("timeentry: timer is already running")
	ErrAlreadyPaused  = errors.New("timeentry: timer is already paused")
	ErrNotRunning     = errors.New("timeentry: timer is not currently running")
	ErrNotPaused      = errors.New("timeentry: timer is not currently paused")
	ErrManualNoTimer  = errors.New("timeentry: cannot start, pause or resume a manual time entry")
)
