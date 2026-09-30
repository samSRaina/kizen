package domain

import (
	"context"

	"github.com/google/uuid"
)

type TicketRepository interface {
	Create(ctx context.Context, ticket *Ticket) (*Ticket, error)
	GetByID(ctx context.Context, projectID uuid.UUID, identifier string) (*Ticket, error)
	Delete(ctx context.Context, projectID uuid.UUID, identifier string) error
	ListByProject(ctx context.Context, projectID uuid.UUID) ([]*Ticket, error)
}
