package timeentry

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/application/ports"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/timeentry"
)

type Service struct {
	repo ports.TimeEntryRepository
	log  *slog.Logger
}

func NewService(repo ports.TimeEntryRepository, log *slog.Logger) *Service {
	return &Service{repo: repo, log: log}
}

func (s *Service) List(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	ticketID *uuid.UUID,
) ([]timeentry.TimeEntry, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", timeentry.ErrInvalidInput)
	}

	entries, err := s.repo.ListByWorkspace(ctx, caller.UserID, workspaceID, ticketID)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to list time entries",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", caller.UserID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("listing time entries: %w", err)
	}

	return entries, nil
}

func (s *Service) Get(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*timeentry.TimeEntry, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", timeentry.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid time entry uuid", timeentry.ErrInvalidInput)
	}

	te, err := s.repo.GetByID(ctx, caller.UserID, workspaceID, id)
	if err != nil {
		return nil, err
	}

	return te, nil
}

func (s *Service) Create(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	input timeentry.CreateInput,
) (*timeentry.TimeEntry, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", timeentry.ErrInvalidInput)
	}

	if err := input.Validate(); err != nil {
		return nil, err
	}

	// If starting an active timer, auto-stop any existing active timer for this workspace
	if input.EndedAt == nil {
		if err := s.repo.StopActive(ctx, caller.UserID, workspaceID); err != nil {
			s.log.ErrorContext(ctx, "failed to stop existing active timer",
				slog.String("workspace_id", workspaceID.String()),
				slog.String("user_id", caller.UserID.String()),
				slog.Any("error", err),
			)
			return nil, fmt.Errorf("stopping existing timer: %w", err)
		}
	}

	te, err := s.repo.Create(ctx, caller.UserID, workspaceID, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to create time entry",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", caller.UserID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("creating time entry: %w", err)
	}

	s.log.InfoContext(ctx, "time entry created successfully",
		slog.String("time_entry_id", te.ID.String()),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("user_id", caller.UserID.String()),
		slog.Bool("is_running", te.IsRunning()),
	)

	return te, nil
}

func (s *Service) Stop(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*timeentry.TimeEntry, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", timeentry.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid time entry uuid", timeentry.ErrInvalidInput)
	}

	te, err := s.repo.Stop(ctx, caller.UserID, workspaceID, id)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to stop time entry",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("time_entry_id", id.String()),
			slog.String("user_id", caller.UserID.String()),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "time entry stopped successfully",
		slog.String("time_entry_id", te.ID.String()),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("user_id", caller.UserID.String()),
		slog.Any("duration_seconds", te.DurationSeconds),
	)

	return te, nil
}

func (s *Service) Update(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	id uuid.UUID,
	input timeentry.UpdateInput,
) (*timeentry.TimeEntry, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", timeentry.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid time entry uuid", timeentry.ErrInvalidInput)
	}

	if err := input.Validate(); err != nil {
		return nil, err
	}

	te, err := s.repo.Update(ctx, caller.UserID, workspaceID, id, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to update time entry",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("time_entry_id", id.String()),
			slog.String("user_id", caller.UserID.String()),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "time entry updated successfully",
		slog.String("time_entry_id", te.ID.String()),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("user_id", caller.UserID.String()),
	)

	return te, nil
}

func (s *Service) Delete(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	id uuid.UUID,
) error {
	if caller.UserID == "" {
		return auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return fmt.Errorf("%w: invalid workspace uuid", timeentry.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return fmt.Errorf("%w: invalid time entry uuid", timeentry.ErrInvalidInput)
	}

	if err := s.repo.Delete(ctx, caller.UserID, workspaceID, id); err != nil {
		s.log.ErrorContext(ctx, "failed to delete time entry",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("time_entry_id", id.String()),
			slog.String("user_id", caller.UserID.String()),
			slog.Any("error", err),
		)
		return err
	}

	s.log.InfoContext(ctx, "time entry deleted successfully",
		slog.String("time_entry_id", id.String()),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("user_id", caller.UserID.String()),
	)

	return nil
}
