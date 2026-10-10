package domain

import (
	"context"

	"github.com/google/uuid"
)

type TicketRepository interface {
	Create(ctx context.Context, input *Ticket, workspaceKey string) (*Ticket, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Ticket, error)
	ListByWorkspace(ctx context.Context, workspaceID uuid.UUID) ([]*Ticket, error)
	Update(ctx context.Context, ticket *Ticket) error
	Delete(ctx context.Context, id uuid.UUID) error
}
