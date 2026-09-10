// Package domain provides basic models for the workspace-service
//
// The package defines command models for handler
// inputs so the domain entities aren't forced to hold
// zero-value IDs or timestamps during creation.

package domain

import (
	"time"

	"github.com/google/uuid"
)

type Workspace struct {
	ID                uuid.UUID
	Name              string
	DefaultHourlyRate int
	Description       *string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

type CreateWorkspaceInput struct {
	Name              string
	DefaultHourlyRate int
	Description       *string
}
