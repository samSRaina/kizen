package domain

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	List(ctx context.Context, userID string) ([]Workspace, error)
	Create(ctx context.Context, ws WorkspaceInput) (*Workspace, error)
	Delete(ctx context.Context, userID string, id uuid.UUID) error
}
