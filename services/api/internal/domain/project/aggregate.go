package project

import (
	"time"

	"github.com/google/uuid"
)

type Project struct {
	ID                uuid.UUID
	WorkspaceID       uuid.UUID
	Name              string
	TicketIDPrefix    string
	Settings          map[string]any
	DefaultHourlyRate int
	Description       *string
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DeletedAt         *time.Time
}
