package track

import (
	"time"

	"github.com/google/uuid"
)

type Track struct {
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
func (t *Track) IsRunning() bool {
	return !t.IsManual && t.TimerState == TimerStateRunning
}

// IsPaused indicates whether the live timer is currently paused.
func (t *Track) IsPaused() bool {
	return !t.IsManual && t.TimerState == TimerStatePaused
}

// IsStopped indicates whether the entry timer is stopped.
func (t *Track) IsStopped() bool {
	return t.TimerState == TimerStateStopped
}
