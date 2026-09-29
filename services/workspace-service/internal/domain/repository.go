package domain

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	List(ctx context.Context) ([]Workspace, error)
	Create(ctx context.Context, ws CreateWorkspaceInput) (*Workspace, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
