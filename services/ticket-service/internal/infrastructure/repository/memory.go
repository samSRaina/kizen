package repository

import (
	"context"
	"fmt"
	"sync"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/services/ticket-service/internal/domain"
)

type inMemRepo struct {
	mu      sync.RWMutex
	tickets map[uuid.UUID]*domain.Ticket
}

func NewInMemRepo() *inMemRepo {
	return &inMemRepo{
		tickets: make(map[uuid.UUID]*domain.Ticket),
	}
}

func (r *inMemRepo) Create(ctx context.Context, ticket *domain.Ticket) (*domain.Ticket, error) {
	const op = "ticket.repository.Create"

	if err := ctx.Err(); err != nil {
		return nil, err
	}
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.tickets[ticket.ID]; exists {
		return nil, fmt.Errorf("%s : %w", op, domain.ErrTicketExists)
	}
	r.tickets[ticket.ID] = ticket
	return ticket, nil
}
