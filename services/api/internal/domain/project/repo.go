package project

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, input CreateInput) (*Project, error)
	ListByWorkspace(ctx context.Context, workspaceID uuid.UUID) ([]Project, error)
	GetByID(ctx context.Context, workspaceID, projectID uuid.UUID) (*Project, error)
	Update(ctx context.Context, workspaceID, projectID uuid.UUID, input UpdateInput) (*Project, error)
	Delete(ctx context.Context, workspaceID, projectID uuid.UUID) error
}
