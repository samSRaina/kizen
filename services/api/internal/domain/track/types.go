package track

import (
	"time"

	"github.com/google/uuid"
)

type TimerState string

const (
	TimerStateRunning TimerState = "running"
	TimerStatePaused  TimerState = "paused"
	TimerStateStopped TimerState = "stopped"
)

func (s TimerState) IsValid() bool {
	switch s {
	case TimerStateRunning, TimerStatePaused, TimerStateStopped:
		return true
	default:
		return false
	}
}

func (s TimerState) String() string {
	return string(s)
}

type TimeEntry struct {
	ID              uuid.UUID
	WorkspaceID     uuid.UUID
	TicketID        *uuid.UUID
	Description     *string
	StartedAt       time.Time
	EndedAt         *time.Time
	DurationSeconds *int
	Billable        bool
	HourlyRate      int
	IsManual        bool
	TimerState      TimerState
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// IsRunning indicates whether the timer is currently actively running.
func (t *TimeEntry) IsRunning() bool {
	return !t.IsManual && t.TimerState == TimerStateRunning
}

// IsPaused indicates whether the live timer is currently paused.
func (t *TimeEntry) IsPaused() bool {
	return !t.IsManual && t.TimerState == TimerStatePaused
}

// IsStopped indicates whether the entry timer is stopped.
func (t *TimeEntry) IsStopped() bool {
	return t.TimerState == TimerStateStopped
}
