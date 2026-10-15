package workspace

import (
	"time"

	"github.com/google/uuid"
)

// Workspace represents a client/project workspace owned by a user.
type Workspace struct {
	ID                uuid.UUID
	OwnerID           string
	Name              string
	DefaultHourlyRate int
	Description       *string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

// CreateWorkspaceInput contains the validated parameters required to create a workspace.
type CreateWorkspaceInput struct {
	Name              string
	DefaultHourlyRate int
	Description       *string
}
