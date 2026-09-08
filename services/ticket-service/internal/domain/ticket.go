package domain

import (
	"time"

	"github.com/google/uuid"
)

type Ticket struct {
	ID         uuid.UUID
	ProjectID  uuid.UUID
	Identifier string

	Title       string
	Description string

	Status    TicketStatus
	Priority  TicketPriority
	Tags      []string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type TicketPriority string

const (
	PriorityCritical TicketPriority = "critical"
	PriorityHigh     TicketPriority = "high"
	PriorityMedium   TicketPriority = "medium"
	PriorityLow      TicketPriority = "low"
)

type TicketStatus string

const (
	StatusBacklog    TicketStatus = "backlog"
	StatusInProgress TicketStatus = "in_progress"
	StatusInReview   TicketStatus = "in_review"
	StatusDone       TicketStatus = "done"
)
