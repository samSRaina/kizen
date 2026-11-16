package ticket

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/ticket"
)

type Service struct {
	repo ticket.Repository
	log  *slog.Logger
}

func NewService(repo ticket.Repository, log *slog.Logger) *Service {
	return &Service{repo: repo, log: log}
}

func (s *Service) List(
	ctx context.Context,
	workspaceID uuid.UUID,
) ([]ticket.Ticket, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", ticket.ErrInvalidInput)
	}

	tickets, err := s.repo.ListByWorkspace(ctx, userID, workspaceID)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to list tickets",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("listing tickets: %w", err)
	}

	return tickets, nil
}

func (s *Service) ListByProject(
	ctx context.Context,
	workspaceID, projectID uuid.UUID,
) ([]ticket.Ticket, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil || projectID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace or project uuid", ticket.ErrInvalidInput)
	}

	tickets, err := s.repo.ListByProject(ctx, userID, workspaceID, projectID)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to list project tickets",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("project_id", projectID.String()),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("listing project tickets: %w", err)
	}

	return tickets, nil
}

func (s *Service) Get(
	ctx context.Context,
	workspaceID uuid.UUID,
	identifier string,
) (*ticket.Ticket, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", ticket.ErrInvalidInput)
	}
	if identifier == "" {
		return nil, fmt.Errorf("%w: ticket identifier cannot be empty", ticket.ErrInvalidInput)
	}

	t, err := s.repo.GetByIdentifier(ctx, userID, workspaceID, identifier)
	if err != nil {
		return nil, err
	}

	return t, nil
}

func (s *Service) GetByProject(
	ctx context.Context,
	workspaceID, projectID uuid.UUID,
	identifier string,
) (*ticket.Ticket, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil || projectID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace or project uuid", ticket.ErrInvalidInput)
	}
	if identifier == "" {
		return nil, fmt.Errorf("%w: ticket identifier cannot be empty", ticket.ErrInvalidInput)
	}

	t, err := s.repo.GetByProjectAndIdentifier(ctx, userID, workspaceID, projectID, identifier)
	if err != nil {
		return nil, err
	}

	return t, nil
}

func (s *Service) Create(
	ctx context.Context,
	workspaceID uuid.UUID,
	input ticket.CreateInput,
) (*ticket.Ticket, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", ticket.ErrInvalidInput)
	}

	if err := input.Validate(); err != nil {
		return nil, err
	}

	t, err := s.repo.Create(ctx, userID, workspaceID, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to create ticket",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("creating ticket: %w", err)
	}

	s.log.InfoContext(ctx, "ticket created successfully",
		slog.String("ticket_id", t.ID.String()),
		slog.String("identifier", t.Identifier),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("project_id", t.ProjectID.String()),
		slog.String("user_id", userID.String()),
	)

	return t, nil
}

func (s *Service) CreateForProject(
	ctx context.Context,
	workspaceID, projectID uuid.UUID,
	input ticket.CreateInput,
) (*ticket.Ticket, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil || projectID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace or project uuid", ticket.ErrInvalidInput)
	}

	if err := input.Validate(); err != nil {
		return nil, err
	}

	input.ProjectID = &projectID
	t, err := s.repo.CreateForProject(ctx, userID, workspaceID, projectID, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to create project ticket",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("project_id", projectID.String()),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("creating project ticket: %w", err)
	}

	s.log.InfoContext(ctx, "project ticket created successfully",
		slog.String("ticket_id", t.ID.String()),
		slog.String("identifier", t.Identifier),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("project_id", t.ProjectID.String()),
		slog.String("user_id", userID.String()),
	)

	return t, nil
}

func (s *Service) Update(
	ctx context.Context,
	workspaceID uuid.UUID,
	identifier string,
	input ticket.UpdateInput,
) (*ticket.Ticket, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
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

	if input.Status != nil {
		existing, err := s.repo.GetByIdentifier(ctx, userID, workspaceID, identifier)
		if err != nil {
			return nil, err
		}
		if err := existing.TransitionStatus(*input.Status); err != nil {
			return nil, err
		}
	}

	t, err := s.repo.Update(ctx, userID, workspaceID, identifier, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to update ticket",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("identifier", identifier),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "ticket updated successfully",
		slog.String("ticket_id", t.ID.String()),
		slog.String("identifier", t.Identifier),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("user_id", userID.String()),
	)

	return t, nil
}

func (s *Service) Delete(
	ctx context.Context,
	workspaceID uuid.UUID,
	identifier string,
) error {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return err
	}
	if workspaceID == uuid.Nil {
		return fmt.Errorf("%w: invalid workspace uuid", ticket.ErrInvalidInput)
	}
	if identifier == "" {
		return fmt.Errorf("%w: ticket identifier cannot be empty", ticket.ErrInvalidInput)
	}

	if err := s.repo.Delete(ctx, userID, workspaceID, identifier); err != nil {
		s.log.ErrorContext(ctx, "failed to delete ticket",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("identifier", identifier),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return err
	}

	s.log.InfoContext(ctx, "ticket deleted successfully",
		slog.String("identifier", identifier),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("user_id", userID.String()),
	)

	return nil
}
