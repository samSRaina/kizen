package domain

import (
	"context"

	"github.com/google/uuid"
)

type Workspace struct {
	DefaultHourlyRate int
	Id                uuid.UUID
	Name              string
}

type WorkspaceRepository interface {
	CreateWorkspace(ctx context.Context, workspace *Workspace) (*Workspace, error)
}
