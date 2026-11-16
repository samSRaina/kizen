package project

import (
	"context"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
)

type Repository interface {
	Create(ctx context.Context, ownerID auth.UserID, input CreateInput) (*Project, error)
	ListByWorkspace(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID) ([]Project, error)
	GetByID(ctx context.Context, ownerID auth.UserID, workspaceID, projectID uuid.UUID) (*Project, error)
	Update(ctx context.Context, ownerID auth.UserID, workspaceID, projectID uuid.UUID, input UpdateInput) (*Project, error)
	Delete(ctx context.Context, ownerID auth.UserID, workspaceID, projectID uuid.UUID) error
}
