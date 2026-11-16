package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/api/internal/adapter/repository/postgres/gen"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/track"
)

type TrackRepository struct {
	pool *pgxpool.Pool
	q    *gen.Queries
}

func NewTrackRepository(pool *pgxpool.Pool) *TrackRepository {
	return &TrackRepository{
		pool: pool,
		q:    gen.New(pool),
	}
}

var _ track.Repository = (*TrackRepository)(nil)

func (r *TrackRepository) ListByWorkspace(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	ticketID *uuid.UUID,
) ([]track.Track, error) {
	var ticketIDUUID pgtype.UUID
	if ticketID != nil {
		ticketIDUUID = pgtype.UUID{Bytes: *ticketID, Valid: true}
	}

	rows, err := r.q.ListTimeEntries(ctx, gen.ListTimeEntriesParams{
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
		TicketID:    ticketIDUUID,
	})
	if err != nil {
		return nil, fmt.Errorf("db list track entries: %w", err)
	}

	result := make([]track.Track, len(rows))
	for i, row := range rows {
		result[i] = mapGenTrackToDomain(row)
	}
	return result, nil
}

func (r *TrackRepository) GetByID(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*track.Track, error) {
	row, err := r.q.GetTimeEntryByID(ctx, gen.GetTimeEntryByIDParams{
		ID:          id,
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, track.ErrNotFound
		}
		return nil, fmt.Errorf("db get track entry: %w", err)
	}

	te := mapGenTrackToDomain(row)
	return &te, nil
}

func (r *TrackRepository) GetActive(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
) (*track.Track, error) {
	row, err := r.q.GetActiveTimeEntry(ctx, gen.GetActiveTimeEntryParams{
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, track.ErrNotFound
		}
		return nil, fmt.Errorf("db get active track entry: %w", err)
	}

	te := mapGenTrackToDomain(row)
	return &te, nil
}

func (r *TrackRepository) StopActive(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
) error {
	err := r.q.StopActiveTimeEntries(ctx, gen.StopActiveTimeEntriesParams{
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		return fmt.Errorf("db stop active track entries: %w", err)
	}
	return nil
}

func (r *TrackRepository) Create(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	input track.CreateInput,
) (*track.Track, error) {
	var ticketIDUUID pgtype.UUID
	if input.TicketID != nil {
		ticketIDUUID = pgtype.UUID{Bytes: *input.TicketID, Valid: true}
	}

	startedAt := time.Now().UTC()
	if input.StartedAt != nil {
		startedAt = *input.StartedAt
	}

	var endedAtTz pgtype.Timestamptz
	if input.EndedAt != nil {
		endedAtTz = pgtype.Timestamptz{Time: *input.EndedAt, Valid: true}
	}

	var durI32 *int32
	if input.DurationSeconds != nil {
		d := int32(*input.DurationSeconds)
		durI32 = &d
	}

	billable := true
	if input.Billable != nil {
		billable = *input.Billable
	}

	var rateI32 *int32
	if input.HourlyRate != nil {
		rate := int32(*input.HourlyRate)
		rateI32 = &rate
	}

	isManual := false
	if input.IsManual != nil {
		isManual = *input.IsManual
	}

	timerState := string(track.TimerStateStopped)
	if input.TimerState != nil {
		timerState = string(*input.TimerState)
	} else if !isManual && input.EndedAt == nil {
		timerState = string(track.TimerStateRunning)
	}

	row, err := r.q.CreateTimeEntry(ctx, gen.CreateTimeEntryParams{
		TicketID:        ticketIDUUID,
		Description:     input.Description,
		StartedAt:       startedAt,
		EndedAt:         endedAtTz,
		DurationSeconds: durI32,
		Billable:        billable,
		HourlyRate:      rateI32,
		IsManual:        isManual,
		TimerState:      timerState,
		WorkspaceID:     workspaceID,
		OwnerID:         ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, track.ErrNotFound
		}
		return nil, fmt.Errorf("db create track entry: %w", err)
	}

	te := mapGenTrackToDomain(row)
	return &te, nil
}

func (r *TrackRepository) Pause(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*track.Track, error) {
	row, err := r.q.PauseTimeEntry(ctx, gen.PauseTimeEntryParams{
		ID:          id,
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, track.ErrNotRunning
		}
		return nil, fmt.Errorf("db pause track entry: %w", err)
	}

	te := mapGenTrackToDomain(row)
	return &te, nil
}

func (r *TrackRepository) Resume(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*track.Track, error) {
	row, err := r.q.ResumeTimeEntry(ctx, gen.ResumeTimeEntryParams{
		ID:          id,
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, track.ErrNotPaused
		}
		return nil, fmt.Errorf("db resume track entry: %w", err)
	}

	te := mapGenTrackToDomain(row)
	return &te, nil
}

func (r *TrackRepository) Stop(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*track.Track, error) {
	row, err := r.q.StopTimeEntry(ctx, gen.StopTimeEntryParams{
		ID:          id,
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, track.ErrAlreadyStopped
		}
		return nil, fmt.Errorf("db stop track entry: %w", err)
	}

	te := mapGenTrackToDomain(row)
	return &te, nil
}

func (r *TrackRepository) Update(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
	input track.UpdateInput,
) (*track.Track, error) {
	var ticketIDUUID pgtype.UUID
	if input.TicketID != nil {
		ticketIDUUID = pgtype.UUID{Bytes: *input.TicketID, Valid: true}
	}

	var startedAtTz pgtype.Timestamptz
	if input.StartedAt != nil {
		startedAtTz = pgtype.Timestamptz{Time: *input.StartedAt, Valid: true}
	}

	var endedAtTz pgtype.Timestamptz
	if input.EndedAt != nil {
		endedAtTz = pgtype.Timestamptz{Time: *input.EndedAt, Valid: true}
	}

	var durI32 *int32
	if input.DurationSeconds != nil {
		d := int32(*input.DurationSeconds)
		durI32 = &d
	}

	var rateI32 *int32
	if input.HourlyRate != nil {
		rate := int32(*input.HourlyRate)
		rateI32 = &rate
	}

	var timerStateStr *string
	if input.TimerState != nil {
		str := string(*input.TimerState)
		timerStateStr = &str
	}

	row, err := r.q.UpdateTimeEntry(ctx, gen.UpdateTimeEntryParams{
		TicketID:        ticketIDUUID,
		Description:     input.Description,
		StartedAt:       startedAtTz,
		EndedAt:         endedAtTz,
		DurationSeconds: durI32,
		Billable:        input.Billable,
		HourlyRate:      rateI32,
		IsManual:        input.IsManual,
		TimerState:      timerStateStr,
		ID:              id,
		WorkspaceID:     workspaceID,
		OwnerID:         ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, track.ErrNotFound
		}
		return nil, fmt.Errorf("db update track entry: %w", err)
	}

	te := mapGenTrackToDomain(row)
	return &te, nil
}

func (r *TrackRepository) Delete(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) error {
	rowsAffected, err := r.q.DeleteTimeEntry(ctx, gen.DeleteTimeEntryParams{
		ID:          id,
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		return fmt.Errorf("db delete track entry: %w", err)
	}
	if rowsAffected == 0 {
		return track.ErrNotFound
	}
	return nil
}

func mapGenTrackToDomain(row gen.TimeEntry) track.Track {
	var ticketID *uuid.UUID
	if row.TicketID.Valid {
		id := uuid.UUID(row.TicketID.Bytes)
		ticketID = &id
	}

	var endedAt *time.Time
	if row.EndedAt.Valid {
		t := row.EndedAt.Time
		endedAt = &t
	}

	var durationSeconds *int
	if row.DurationSeconds != nil {
		dur := int(*row.DurationSeconds)
		durationSeconds = &dur
	}

	return track.Track{
		ID:              row.ID,
		WorkspaceID:     row.WorkspaceID,
		TicketID:        ticketID,
		Description:     row.Description,
		StartedAt:       row.StartedAt,
		EndedAt:         endedAt,
		DurationSeconds: durationSeconds,
		Billable:        row.Billable,
		HourlyRate:      int(row.HourlyRate),
		IsManual:        row.IsManual,
		TimerState:      track.TimerState(row.TimerState),
		CreatedAt:       row.CreatedAt,
		UpdatedAt:       row.UpdatedAt,
	}
}
