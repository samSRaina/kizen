package ports

import (
	"context"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/ticket"
	"github.com/samSRaina/kizen/api/internal/domain/workspace"
)

type WorkspaceRepository interface {
	Create(ctx context.Context, ownerID auth.UserID, input workspace.CreateInput) (*workspace.Workspace, error)
	ListByUser(ctx context.Context, ownerID auth.UserID) ([]workspace.Workspace, error)
	GetByID(ctx context.Context, ownerID auth.UserID, id uuid.UUID) (*workspace.Workspace, error)
	Delete(ctx context.Context, ownerID auth.UserID, id uuid.UUID) error
}

type TicketRepository interface {
	ListByWorkspace(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID) ([]ticket.Ticket, error)
	GetByIdentifier(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, identifier string) (*ticket.Ticket, error)
	Create(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, input ticket.CreateInput) (*ticket.Ticket, error)
	Update(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, identifier string, input ticket.UpdateInput) (*ticket.Ticket, error)
	Delete(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, identifier string) error
}
