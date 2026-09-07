package domain

import (
	"time"

	"github.com/google/uuid"
)

type Ticket struct {
	ID        uuid.UUID
	ProjectID uuid.UUID

	Identifier string

	Title       string
	Description string

	// Position float64

	// Type TicketType
	Status   TicketStatus
	Priority TicketPriority

	CreatedBy uuid.UUID
	Assignee  *uuid.UUID

	DueDate *time.Time

	CreatedAt time.Time
	UpdatedAt time.Time
	// DeleteAt : soft deletes
	// DeletedAt *time.Time
}

// type TicketType string
//
// const (
//
//	TicketTypeTask  TicketType = "task"
//	TicketTypeBug   TicketType = "bug"
//	TicketTypeStory TicketType = "story"
//	TicketTypeEpic  TicketType = "epic"
//
// )
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
