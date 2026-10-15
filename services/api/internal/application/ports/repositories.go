package ports

import (
	"context"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/workspace"
)

type WorkspaceRepository interface {
	Create(ctx context.Context, ownerID auth.UserID, input workspace.CreateInput) (*workspace.Workspace, error)
	ListByUser(ctx context.Context, ownerID auth.UserID) ([]workspace.Workspace, error)
	GetByID(ctx context.Context, ownerID auth.UserID, id uuid.UUID) (*workspace.Workspace, error)
	Delete(ctx context.Context, ownerID auth.UserID, id uuid.UUID) error
}
