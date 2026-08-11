package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Ticket struct {
	ID        uuid.UUID
	ProjectID uuid.UUID

	Identifier string

	Title       string
	Description string

	Status   TicketStatus
	Priority TicketPriority

	CreatedBy uuid.UUID
	Assignee  *uuid.UUID

	DueDate *time.Time

	CreatedAt time.Time
	UpdatedAt time.Time
}

type TicketRepository interface {
	Create(ctx context.Context, ticket *Ticket) (*Ticket, error)
	// Delete(ctx context.Context, ticketID uuid.UUID) error
	// Update(ctx context.Context, ticket *Ticket) (*Ticket, error)
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
