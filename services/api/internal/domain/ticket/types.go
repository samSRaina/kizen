package ticket

import (
	"time"

	"github.com/google/uuid"
)

type Ticket struct {
	ID          uuid.UUID
	WorkspaceID uuid.UUID
	Identifier  string
	Title       string
	Description *string
	Type        Type
	Status      Status
	Priority    Priority
	Points      int
	Tags        []string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type Status string

const (
	StatusBacklog  Status = "backlog"
	StatusTodo     Status = "todo"
	StatusProgress Status = "progress"
	StatusReview   Status = "review"
	StatusDone     Status = "done"
)

type Priority string

const (
	PriorityCritical Priority = "Critical"
	PriorityHigh     Priority = "High"
	PriorityMedium   Priority = "Medium"
	PriorityLow      Priority = "Low"
)

type Type string

const (
	TypeFeature Type = "feature"
	TypeBug     Type = "bug"
	TypeTask    Type = "task"
)

// =============================================================================
// INPUT VALUE OBJECTS (Use Case DTOs with Invariant Validation)
// =============================================================================

type CreateInput struct {
	Title       string
	Description *string
	Type        Type
	Status      *Status
	Priority    Priority
	Points      int
	Tags        []string
}

type UpdateInput struct {
	Title       *string
	Description *string
	Type        *Type
	Status      *Status
	Priority    *Priority
	Points      *int
	Tags        *[]string
}
