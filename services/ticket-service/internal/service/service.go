package service

import (
	"context"
	"fmt"

	"github.com/samSRaina/kizen/services/ticket-service/internal/domain"
)

// type CreateTicketInput struct {
// 	ProjectID   uuid.UUID
// 	Title       string
// 	Description string
// }

type service struct {
	repo domain.TicketRepository
}

func NewService(repo domain.TicketRepository) *service {
	return &service{
		repo: repo,
	}
}

func (s *service) Create(ctx context.Context, ticket *domain.Ticket) (*domain.Ticket, error) {
	const op = "ticket.service.Create"

	t, err := s.repo.Create(ctx, ticket)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return t, nil
}
