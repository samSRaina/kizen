package track

import (
	"time"

	"github.com/google/uuid"
)

type CreateInput struct {
	TicketID        *uuid.UUID
	Description     *string
	StartedAt       *time.Time
	EndedAt         *time.Time
	DurationSeconds *int
	Billable        *bool
	HourlyRate      *int
	IsManual        *bool
	TimerState      *TimerState
}

type UpdateInput struct {
	TicketID        *uuid.UUID
	Description     *string
	StartedAt       *time.Time
	EndedAt         *time.Time
	DurationSeconds *int
	Billable        *bool
	HourlyRate      *int
	IsManual        *bool
	TimerState      *TimerState
}
