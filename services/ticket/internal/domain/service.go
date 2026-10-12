package domain

import (
	"context"
)

type TicketService interface {
	Create(ctx context.Context, input CreateTicketInput) (*Ticket, error)
	// RepositionTicket(ctx context.Context)
}
