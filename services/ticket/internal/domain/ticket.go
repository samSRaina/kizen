package domain

import (
	"time"

	"github.com/google/uuid"
)

type Ticket struct {
	ID          uuid.UUID      `json:"id"`
	ProjectID   uuid.UUID      `json:"project_id"`
	Identifier  string         `json:"identifier"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Status      TicketStatus   `json:"status"`
	Priority    TicketPriority `json:"priority"`
	Tags        []string       `json:"tags"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
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

type CreateTicketInput struct {
	ProjectID   uuid.UUID      `json:"project_id"`
	Identifier  string         `json:"identifier"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Priority    TicketPriority `json:"priority"`
	Tags        []string       `json:"tags,omitempty"`
}
