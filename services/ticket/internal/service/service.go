package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/services/ticket/internal/domain"
)

type service struct {
	repo domain.TicketRepository
}

func NewService(repo domain.TicketRepository) *service {
	return &service{
		repo: repo,
	}
}

func validateTicket(ticket *domain.Ticket) error {
	const op = "ticket.service.validateTicket"

	if ticket == nil {
		return fmt.Errorf("%s: ticket is nil", op)
	}

	if ticket.ProjectID == uuid.Nil {
		return fmt.Errorf("%s: project_id is required", op)
	}

	if strings.TrimSpace(ticket.Identifier) == "" {
		return fmt.Errorf("%s: identifier is required", op)
	}

	if strings.TrimSpace(ticket.Title) == "" {
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
		return fmt.Errorf("%s: invalid priority %q", op, ticket.Priority)
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

func (s *service) GetByID(ctx context.Context, projectID uuid.UUID, identifier string) (*domain.Ticket, error) {
	const op = "ticket.service.GetByID"

	t, err := s.repo.GetByID(ctx, projectID, identifier)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return t, nil
}

func (s *service) Delete(ctx context.Context, projectID uuid.UUID, identifier string) error {
	const op = "ticket.service.Delete"

	err := s.repo.Delete(ctx, projectID, identifier)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (s *service) ListByProject(ctx context.Context, projectID uuid.UUID) ([]*domain.Ticket, error) {
	const op = "ticket.service.ListByProject"

	tickets, err := s.repo.ListByProject(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return tickets, nil
}
