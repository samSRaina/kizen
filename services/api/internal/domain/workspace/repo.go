package workspace

import (
	"context"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
)

type WorkspaceRepository interface {
	Create(ctx context.Context, ownerID auth.UserID, input CreateInput) (*Workspace, error)
	ListByUser(ctx context.Context, ownerID auth.UserID) ([]Workspace, error)
	GetByID(ctx context.Context, ownerID auth.UserID, id uuid.UUID) (*Workspace, error)
	Update(ctx context.Context, ownerID auth.UserID, id uuid.UUID, input UpdateInput) (*Workspace, error)
	Delete(ctx context.Context, ownerID auth.UserID, id uuid.UUID) error
}

type Repository = WorkspaceRepository
