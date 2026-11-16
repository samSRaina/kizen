package ticket

import (
	"context"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
)

type Repository interface {
	ListByWorkspace(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID) ([]Ticket, error)
	ListByProject(ctx context.Context, ownerID auth.UserID, workspaceID, projectID uuid.UUID) ([]Ticket, error)
	GetByIdentifier(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, identifier string) (*Ticket, error)
	GetByProjectAndIdentifier(ctx context.Context, ownerID auth.UserID, workspaceID, projectID uuid.UUID, identifier string) (*Ticket, error)
	Create(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, input CreateInput) (*Ticket, error)
	CreateForProject(ctx context.Context, ownerID auth.UserID, workspaceID, projectID uuid.UUID, input CreateInput) (*Ticket, error)
	Update(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, identifier string, input UpdateInput) (*Ticket, error)
	Delete(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, identifier string) error
}
