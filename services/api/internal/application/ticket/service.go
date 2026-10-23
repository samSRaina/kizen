package ticket

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/application/ports"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/ticket"
)

type Service struct {
	repo ports.TicketRepository
	log  *slog.Logger
}

func NewService(repo ports.TicketRepository, log *slog.Logger) *Service {
	return &Service{repo: repo, log: log}
}

func (s *Service) List(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
) ([]ticket.Ticket, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", ticket.ErrInvalidInput)
	}

	tickets, err := s.repo.ListByWorkspace(ctx, caller.UserID, workspaceID)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to list tickets",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", caller.UserID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("listing tickets: %w", err)
	}

	return tickets, nil
}

func (s *Service) Get(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	identifier string,
) (*ticket.Ticket, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", ticket.ErrInvalidInput)
	}
	if identifier == "" {
		return nil, fmt.Errorf("%w: ticket identifier cannot be empty", ticket.ErrInvalidInput)
	}

	t, err := s.repo.GetByIdentifier(ctx, caller.UserID, workspaceID, identifier)
	if err != nil {
		return nil, err
	}

	return t, nil
}

func (s *Service) Create(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	input ticket.CreateInput,
) (*ticket.Ticket, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", ticket.ErrInvalidInput)
	}

	if err := input.Validate(); err != nil {
		return nil, err
	}

	t, err := s.repo.Create(ctx, caller.UserID, workspaceID, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to create ticket",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", caller.UserID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("creating ticket: %w", err)
	}

	s.log.InfoContext(ctx, "ticket created successfully",
		slog.String("ticket_id", t.ID.String()),
		slog.String("identifier", t.Identifier),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("user_id", caller.UserID.String()),
	)

	return t, nil
}

func (s *Service) Update(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	identifier string,
	input ticket.UpdateInput,
) (*ticket.Ticket, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", ticket.ErrInvalidInput)
	}
	if identifier == "" {
		return nil, fmt.Errorf("%w: ticket identifier cannot be empty", ticket.ErrInvalidInput)
	}

	if err := input.Validate(); err != nil {
		return nil, err
	}

	t, err := s.repo.Update(ctx, caller.UserID, workspaceID, identifier, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to update ticket",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("identifier", identifier),
			slog.String("user_id", caller.UserID.String()),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "ticket updated successfully",
		slog.String("ticket_id", t.ID.String()),
		slog.String("identifier", t.Identifier),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("user_id", caller.UserID.String()),
	)

	return t, nil
}

func (s *Service) Delete(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	identifier string,
) error {
	if caller.UserID == "" {
		return auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return fmt.Errorf("%w: invalid workspace uuid", ticket.ErrInvalidInput)
	}
	if identifier == "" {
		return fmt.Errorf("%w: ticket identifier cannot be empty", ticket.ErrInvalidInput)
	}

	if err := s.repo.Delete(ctx, caller.UserID, workspaceID, identifier); err != nil {
		s.log.ErrorContext(ctx, "failed to delete ticket",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("identifier", identifier),
			slog.String("user_id", caller.UserID.String()),
			slog.Any("error", err),
		)
		return err
	}

	s.log.InfoContext(ctx, "ticket deleted successfully",
		slog.String("identifier", identifier),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("user_id", caller.UserID.String()),
	)

	return nil
}
