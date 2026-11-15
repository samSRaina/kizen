package track

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/track"
)

type Service struct {
	repo track.Repository
	log  *slog.Logger
	now  func() time.Time
}

func NewService(repo track.Repository, log *slog.Logger) *Service {
	return &Service{
		repo: repo,
		log:  log,
		now:  time.Now,
	}
}

// SetTimeProvider sets a custom time function (primarily for testing).
func (s *Service) SetTimeProvider(fn func() time.Time) {
	s.now = fn
}

func (s *Service) List(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	ticketID *uuid.UUID,
) ([]track.TimeEntry, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
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
) (*track.TimeEntry, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid time entry uuid", track.ErrInvalidInput)
	}

	te, err := s.repo.GetByID(ctx, caller.UserID, workspaceID, id)
	if err != nil {
		return nil, err
	}

	return te, nil
}

// StartTimer starts a live tracking timer for a workspace (and optional ticket).
// If a timer is already running or paused in this workspace, it is automatically stopped.
func (s *Service) StartTimer(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	ticketID *uuid.UUID,
	description *string,
) (*track.TimeEntry, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}

	// 1. Automatically stop any active running/paused timer in this workspace
	if err := s.repo.StopActive(ctx, caller.UserID, workspaceID); err != nil {
		s.log.ErrorContext(ctx, "failed to auto-stop existing timer",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", caller.UserID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("stopping active timer: %w", err)
	}

	// 2. Create the new live timer
	now := s.now().UTC()
	isManual := false
	timerState := track.TimerStateRunning
	input := track.CreateInput{
		TicketID:    ticketID,
		Description: description,
		StartedAt:   &now,
		IsManual:    &isManual,
		TimerState:  &timerState,
	}

	te, err := s.repo.Create(ctx, caller.UserID, workspaceID, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to start live timer",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", caller.UserID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("starting timer: %w", err)
	}

	s.log.InfoContext(ctx, "timer started",
		slog.String("time_entry_id", te.ID.String()),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("user_id", caller.UserID.String()),
	)

	return te, nil
}

// Pause pauses an actively running live timer.
func (s *Service) Pause(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*track.TimeEntry, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid time entry uuid", track.ErrInvalidInput)
	}

	existing, err := s.repo.GetByID(ctx, caller.UserID, workspaceID, id)
	if err != nil {
		return nil, err
	}
	if existing.IsManual {
		return nil, track.ErrManualNoTimer
	}
	if existing.TimerState == track.TimerStatePaused {
		return nil, track.ErrAlreadyPaused
	}
	if existing.TimerState == track.TimerStateStopped {
		return nil, track.ErrAlreadyStopped
	}

	te, err := s.repo.Pause(ctx, caller.UserID, workspaceID, id)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to pause timer",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("time_entry_id", id.String()),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "timer paused",
		slog.String("time_entry_id", te.ID.String()),
		slog.String("workspace_id", workspaceID.String()),
		slog.Any("elapsed_duration", te.DurationSeconds),
	)

	return te, nil
}

// Resume resumes a paused live timer.
// If another timer was started in the meantime, it is auto-stopped before resuming this one.
func (s *Service) Resume(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*track.TimeEntry, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid time entry uuid", track.ErrInvalidInput)
	}

	existing, err := s.repo.GetByID(ctx, caller.UserID, workspaceID, id)
	if err != nil {
		return nil, err
	}
	if existing.IsManual {
		return nil, track.ErrManualNoTimer
	}
	if existing.TimerState == track.TimerStateRunning {
		return nil, track.ErrAlreadyRunning
	}
	if existing.TimerState == track.TimerStateStopped {
		return nil, track.ErrAlreadyStopped
	}

	// Auto-stop any other active timer before resuming
	if active, err := s.repo.GetActive(ctx, caller.UserID, workspaceID); err == nil && active != nil && active.ID != id {
		_ = s.repo.StopActive(ctx, caller.UserID, workspaceID)
	}

	te, err := s.repo.Resume(ctx, caller.UserID, workspaceID, id)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to resume timer",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("time_entry_id", id.String()),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "timer resumed",
		slog.String("time_entry_id", te.ID.String()),
		slog.String("workspace_id", workspaceID.String()),
	)

	return te, nil
}

// Stop completely stops a live timer (running or paused).
func (s *Service) Stop(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*track.TimeEntry, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid time entry uuid", track.ErrInvalidInput)
	}

	existing, err := s.repo.GetByID(ctx, caller.UserID, workspaceID, id)
	if err != nil {
		return nil, err
	}
	if existing.IsManual {
		return nil, track.ErrManualNoTimer
	}
	if existing.TimerState == track.TimerStateStopped {
		return nil, track.ErrAlreadyStopped
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

// Create handles creating a time entry (both live timers and manual retrospective logs).
func (s *Service) Create(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	input track.CreateInput,
) (*track.TimeEntry, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}

	if err := input.Validate(); err != nil {
		return nil, err
	}

	// Auto-detect manual entry: if EndedAt or DurationSeconds is provided directly upon creation
	isLiveTimer := input.EndedAt == nil && (input.IsManual == nil || !*input.IsManual)
	if input.IsManual == nil {
		manualVal := !isLiveTimer
		input.IsManual = &manualVal
	}

	// If starting a live active timer, auto-stop any existing active timer in this workspace
	if isLiveTimer {
		runningState := track.TimerStateRunning
		input.TimerState = &runningState
		if err := s.repo.StopActive(ctx, caller.UserID, workspaceID); err != nil {
			s.log.ErrorContext(ctx, "failed to stop existing active timer",
				slog.String("workspace_id", workspaceID.String()),
				slog.String("user_id", caller.UserID.String()),
				slog.Any("error", err),
			)
			return nil, fmt.Errorf("stopping existing timer: %w", err)
		}
	} else if input.TimerState == nil {
		stoppedState := track.TimerStateStopped
		input.TimerState = &stoppedState
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
		slog.Bool("is_manual", te.IsManual),
		slog.String("timer_state", string(te.TimerState)),
	)

	return te, nil
}

func (s *Service) Update(
	ctx context.Context,
	caller auth.Identity,
	workspaceID uuid.UUID,
	id uuid.UUID,
	input track.UpdateInput,
) (*track.TimeEntry, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid time entry uuid", track.ErrInvalidInput)
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
		return fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return fmt.Errorf("%w: invalid time entry uuid", track.ErrInvalidInput)
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
