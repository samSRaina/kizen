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
	workspaceID uuid.UUID,
	ticketID *uuid.UUID,
) ([]track.Track, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}

	entries, err := s.repo.ListByWorkspace(ctx, userID, workspaceID, ticketID)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to list tracks",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("listing tracks: %w", err)
	}

	return entries, nil
}

func (s *Service) Get(
	ctx context.Context,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*track.Track, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid track uuid", track.ErrInvalidInput)
	}

	te, err := s.repo.GetByID(ctx, userID, workspaceID, id)
	if err != nil {
		return nil, err
	}

	return te, nil
}

// StartTimer starts a live tracking timer for a workspace (and optional ticket).
// If a timer is already running or paused in this workspace, it is automatically stopped.
func (s *Service) StartTimer(
	ctx context.Context,
	workspaceID uuid.UUID,
	ticketID *uuid.UUID,
	description *string,
) (*track.Track, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}

	// 1. Automatically stop any active running/paused timer in this workspace
	if err := s.repo.StopActive(ctx, userID, workspaceID); err != nil {
		s.log.ErrorContext(ctx, "failed to auto-stop existing timer",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", userID.String()),
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

	te, err := s.repo.Create(ctx, userID, workspaceID, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to start live timer",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("starting timer: %w", err)
	}

	s.log.InfoContext(ctx, "timer started",
		slog.String("track_id", te.ID.String()),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("user_id", userID.String()),
	)

	return te, nil
}

// Pause pauses an actively running live timer.
func (s *Service) Pause(
	ctx context.Context,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*track.Track, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid track uuid", track.ErrInvalidInput)
	}

	existing, err := s.repo.GetByID(ctx, userID, workspaceID, id)
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

	te, err := s.repo.Pause(ctx, userID, workspaceID, id)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to pause timer",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("track_id", id.String()),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "timer paused",
		slog.String("track_id", te.ID.String()),
		slog.String("workspace_id", workspaceID.String()),
		slog.Any("elapsed_duration", te.DurationSeconds),
	)

	return te, nil
}

// Resume resumes a paused live timer.
// If another timer was started in the meantime, it is auto-stopped before resuming this one.
func (s *Service) Resume(
	ctx context.Context,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*track.Track, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid track uuid", track.ErrInvalidInput)
	}

	existing, err := s.repo.GetByID(ctx, userID, workspaceID, id)
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
	if active, err := s.repo.GetActive(ctx, userID, workspaceID); err == nil && active != nil && active.ID != id {
		_ = s.repo.StopActive(ctx, userID, workspaceID)
	}

	te, err := s.repo.Resume(ctx, userID, workspaceID, id)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to resume timer",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("track_id", id.String()),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "timer resumed",
		slog.String("track_id", te.ID.String()),
		slog.String("workspace_id", workspaceID.String()),
	)

	return te, nil
}

// Stop completely stops a live timer (running or paused).
func (s *Service) Stop(
	ctx context.Context,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*track.Track, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid track uuid", track.ErrInvalidInput)
	}

	existing, err := s.repo.GetByID(ctx, userID, workspaceID, id)
	if err != nil {
		return nil, err
	}
	if existing.IsManual {
		return nil, track.ErrManualNoTimer
	}
	if existing.TimerState == track.TimerStateStopped {
		return nil, track.ErrAlreadyStopped
	}

	te, err := s.repo.Stop(ctx, userID, workspaceID, id)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to stop track entry",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("track_id", id.String()),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "track entry stopped successfully",
		slog.String("track_id", te.ID.String()),
		slog.String("workspace_id", workspaceID.String()),
		slog.Any("duration_seconds", te.DurationSeconds),
	)

	return te, nil
}

// Create handles creating a track entry (both live timers and manual retrospective logs).
func (s *Service) Create(
	ctx context.Context,
	workspaceID uuid.UUID,
	input track.CreateInput,
) (*track.Track, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
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
		if err := s.repo.StopActive(ctx, userID, workspaceID); err != nil {
			s.log.ErrorContext(ctx, "failed to stop existing active timer",
				slog.String("workspace_id", workspaceID.String()),
				slog.String("user_id", userID.String()),
				slog.Any("error", err),
			)
			return nil, fmt.Errorf("stopping existing timer: %w", err)
		}
	} else if input.TimerState == nil {
		stoppedState := track.TimerStateStopped
		input.TimerState = &stoppedState
	}

	te, err := s.repo.Create(ctx, userID, workspaceID, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to create track entry",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("creating track entry: %w", err)
	}

	s.log.InfoContext(ctx, "track entry created successfully",
		slog.String("track_id", te.ID.String()),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("user_id", userID.String()),
		slog.Bool("is_manual", te.IsManual),
		slog.String("timer_state", string(te.TimerState)),
	)

	return te, nil
}

func (s *Service) Update(
	ctx context.Context,
	workspaceID uuid.UUID,
	id uuid.UUID,
	input track.UpdateInput,
) (*track.Track, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid track uuid", track.ErrInvalidInput)
	}

	if err := input.Validate(); err != nil {
		return nil, err
	}

	te, err := s.repo.Update(ctx, userID, workspaceID, id, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to update track entry",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("track_id", id.String()),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "track entry updated successfully",
		slog.String("track_id", te.ID.String()),
		slog.String("workspace_id", workspaceID.String()),
	)

	return te, nil
}

func (s *Service) Delete(
	ctx context.Context,
	workspaceID uuid.UUID,
	id uuid.UUID,
) error {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return err
	}
	if workspaceID == uuid.Nil {
		return fmt.Errorf("%w: invalid workspace uuid", track.ErrInvalidInput)
	}
	if id == uuid.Nil {
		return fmt.Errorf("%w: invalid track uuid", track.ErrInvalidInput)
	}

	if err := s.repo.Delete(ctx, userID, workspaceID, id); err != nil {
		s.log.ErrorContext(ctx, "failed to delete track entry",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("track_id", id.String()),
			slog.Any("error", err),
		)
		return err
	}

	s.log.InfoContext(ctx, "track entry deleted successfully",
		slog.String("track_id", id.String()),
		slog.String("workspace_id", workspaceID.String()),
	)

	return nil
}
