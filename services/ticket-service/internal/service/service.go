package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/services/ticket-service/internal/domain"
)

type service struct {
	repo domain.TicketRepository
}

func NewService(repo domain.TicketRepository) *service {
	return &service{
		repo: repo,
	}
}

// TODO: FUNCTION TO VALIDATE TICKET
func validateTicket(ticket *domain.Ticket) error {
	const op = "ticket.service.valdiateTicket"

	if ticket == nil {
		return fmt.Errorf("%s: ticket is nil", op)
	}

	if ticket.ProjectID == uuid.Nil {
		return fmt.Errorf("%s: project_id is required", op)
	}

	if ticket.CreatedBy == uuid.Nil {
		return fmt.Errorf("%s: created_by is required", op)
	}

	if ticket.Identifier == "" {
		return fmt.Errorf("%s: identifier is required", op)
	}

	if ticket.Title == "" {
		return fmt.Errorf("%s: title is required", op)
	}

	if ticket.Priority == "" {
		return fmt.Errorf("%s: priority is required", op)
	}

	switch ticket.Priority {
	case domain.PriorityCritical,
		domain.PriorityHigh,
		domain.PriorityMedium,
		domain.PriorityLow:
	default:
		return fmt.Errorf(
			"%s: invalid priority %q",
			op,
			ticket.Priority,
		)
	}
	return nil
}

func (s *service) Create(ctx context.Context, ticket *domain.Ticket) (*domain.Ticket, error) {
	const op = "ticket.service.Create"

	if err := validateTicket(ticket); err != nil {
		return nil, fmt.Errorf("%s: %w: %w", op, domain.ErrInvalidTicket, err)
	}

	t, err := s.repo.Create(ctx, ticket)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return t, nil
}

func (s *service) GetByID(ctx context.Context, project_id uuid.UUID, identifier string) (*domain.Ticket, error) {
	const op = "ticket.service.GetByID"

	t, err := s.repo.GetByID(ctx, project_id, identifier)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return t, nil
}

// func (s *service) Delete(ctx context.Context, projectID uuid.UUID, identifier string) error {
// 	const op = "ticket.service.Delete"

// 	err := s.repo.Delete(ctx, projectID, identifier)

// }
