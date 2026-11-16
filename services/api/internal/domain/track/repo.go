package track

import (
	"context"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
)

type Repository interface {
	ListByWorkspace(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, ticketID *uuid.UUID) ([]Track, error)
	GetByID(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, id uuid.UUID) (*Track, error)
	GetActive(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID) (*Track, error)
	StopActive(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID) error
	Create(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, input CreateInput) (*Track, error)
	Pause(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, id uuid.UUID) (*Track, error)
	Resume(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, id uuid.UUID) (*Track, error)
	Stop(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, id uuid.UUID) (*Track, error)
	Update(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, id uuid.UUID, input UpdateInput) (*Track, error)
	Delete(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, id uuid.UUID) error
}
