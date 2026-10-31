package timeentry

import (
	"time"

	"github.com/google/uuid"
)

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
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// IsRunning indicates whether the timer is currently actively running.
func (t *TimeEntry) IsRunning() bool {
	return t.EndedAt == nil
}

type CreateInput struct {
	TicketID        *uuid.UUID
	Description     *string
	StartedAt       *time.Time
	EndedAt         *time.Time
	DurationSeconds *int
	Billable        *bool
	HourlyRate      *int
}

type UpdateInput struct {
	TicketID        *uuid.UUID
	Description     *string
	StartedAt       *time.Time
	EndedAt         *time.Time
	DurationSeconds *int
	Billable        *bool
	HourlyRate      *int
}
