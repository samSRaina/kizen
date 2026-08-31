package domain

import (
	"context"

	"github.com/google/uuid"
)

type TicketRepository interface {
	Create(ctx context.Context, ticket *Ticket) (*Ticket, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Ticket, error)
	//ListByProject(ctx context.Context, projectID uuid.UUID) ([]*Ticket, error)
	//Delete(ctx context.Context, id uuid.UUID) error
	// Update(ctx context.Context, ticket *Ticket) (*Ticket, error)
}
