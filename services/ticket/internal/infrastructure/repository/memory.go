package repository

import (
	"context"
	"fmt"
	"sync"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/services/ticket/internal/domain"
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

func (r *inMemRepo) GetByID(ctx context.Context, projectID uuid.UUID, identifier string) (*domain.Ticket, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, t := range r.tickets {
		if t.ProjectID == projectID && t.Identifier == identifier {
			return t, nil
		}
	}
	return nil, domain.ErrTicketNotFound
}

func (r *inMemRepo) Delete(ctx context.Context, projectID uuid.UUID, identifier string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for id, t := range r.tickets {
		if t.ProjectID == projectID && t.Identifier == identifier {
			delete(r.tickets, id)
			return nil
		}
	}
	return domain.ErrTicketNotFound
}

func (r *inMemRepo) ListByProject(ctx context.Context, projectID uuid.UUID) ([]*domain.Ticket, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []*domain.Ticket
	for _, t := range r.tickets {
		if t.ProjectID == projectID {
			result = append(result, t)
		}
	}
	return result, nil
}
