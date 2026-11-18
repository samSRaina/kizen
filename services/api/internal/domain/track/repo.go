package track

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	ListByWorkspace(ctx context.Context, workspaceID uuid.UUID, ticketID *uuid.UUID) ([]Track, error)
	GetByID(ctx context.Context, workspaceID uuid.UUID, id uuid.UUID) (*Track, error)
	GetActive(ctx context.Context, workspaceID uuid.UUID) (*Track, error)
	StopActive(ctx context.Context, workspaceID uuid.UUID) error
	Create(ctx context.Context, workspaceID uuid.UUID, input CreateInput) (*Track, error)
	Pause(ctx context.Context, workspaceID uuid.UUID, id uuid.UUID) (*Track, error)
	Resume(ctx context.Context, workspaceID uuid.UUID, id uuid.UUID) (*Track, error)
	Stop(ctx context.Context, workspaceID uuid.UUID, id uuid.UUID) (*Track, error)
	Update(ctx context.Context, workspaceID uuid.UUID, id uuid.UUID, input UpdateInput) (*Track, error)
	Delete(ctx context.Context, workspaceID uuid.UUID, id uuid.UUID) error
}
