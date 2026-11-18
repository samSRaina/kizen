package ws

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, input CreateInput) (*Workspace, error)
	ListByUser(ctx context.Context) ([]Workspace, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Workspace, error)
	Update(ctx context.Context, id uuid.UUID, input UpdateInput) (*Workspace, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
