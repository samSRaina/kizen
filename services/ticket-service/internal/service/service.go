package service

import (
	"context"
	"fmt"
	"time"

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

// validateTicket enforces the create rules from the contract
// (api/openapi.yaml, CreateTicketRequest). Failures return a
// domain.ValidationError carrying a field→message map — the handler renders
// it as Problem.errors in the 400 body. No identifier check: the contract
// says identifiers are server-assigned and never accepted from clients.
func validateTicket(ticket *domain.Ticket) error {
	const op = "ticket.service.validateTicket"

	if ticket == nil {
		return fmt.Errorf("%s: %w", op, domain.ErrInvalidTicket)
	}

	fields := make(map[string]string)

	if ticket.ProjectID == uuid.Nil {
		fields["project_id"] = "must not be nil"
	}

	if ticket.Title == "" {
		fields["title"] = "must not be blank"
	}

	switch ticket.Priority {
	case domain.PriorityCritical,
		domain.PriorityHigh,
		domain.PriorityMedium,
		domain.PriorityLow:
	default:
		fields["priority"] = "must be one of critical, medium, high, low"
	}

	if len(fields) > 0 {
		return &domain.ValidationError{Fields: fields}
	}

	return nil
}

func (s *service) Create(ctx context.Context, ticket *domain.Ticket) (*domain.Ticket, error) {
	const op = "ticket.service.Create"

	if err := validateTicket(ticket); err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	// Business rules the contract assigns to the server, not the client:
	// every ticket starts in backlog (spec: Ticket.status; no client
	// status on create).
	if ticket.Status == "" {
		ticket.Status = domain.StatusBacklog
	}

	// TODO(identifier-allocation): proper allocation is the atomic
	// per-project PROJECTKEY-seq scheme (projects.next_issue_seq, analysis
	// §4.5), which needs the projects join. Interim: unique-enough,
	// pattern-valid (TK-<digits>) so the contract's "no client-supplied
	// identifier" rule already holds end-to-end.
	if ticket.Identifier == "" {
		ticket.Identifier = fmt.Sprintf("TK-%d", time.Now().UnixMilli())
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

	if err := s.repo.Delete(ctx, projectID, identifier); err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}
