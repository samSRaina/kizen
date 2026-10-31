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
	"github.com/samSRaina/kizen/api/internal/application/ports"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/timeentry"
	"github.com/samSRaina/kizen/api/internal/repository/postgres/gen"
)

type TimeEntryRepository struct {
	q *gen.Queries
}

func NewTimeEntryRepository(pool *pgxpool.Pool) *TimeEntryRepository {
	return &TimeEntryRepository{
		q: gen.New(pool),
	}
}

var _ ports.TimeEntryRepository = (*TimeEntryRepository)(nil)

func (r *TimeEntryRepository) ListByWorkspace(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	ticketID *uuid.UUID,
) ([]timeentry.TimeEntry, error) {
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
		return nil, fmt.Errorf("db list time entries: %w", err)
	}

	result := make([]timeentry.TimeEntry, len(rows))
	for i, row := range rows {
		result[i] = mapGenTimeEntryToDomain(row)
	}
	return result, nil
}

func (r *TimeEntryRepository) GetByID(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*timeentry.TimeEntry, error) {
	row, err := r.q.GetTimeEntryByID(ctx, gen.GetTimeEntryByIDParams{
		ID:          id,
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, timeentry.ErrNotFound
		}
		return nil, fmt.Errorf("db get time entry: %w", err)
	}

	te := mapGenTimeEntryToDomain(row)
	return &te, nil
}

func (r *TimeEntryRepository) GetActive(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
) (*timeentry.TimeEntry, error) {
	row, err := r.q.GetActiveTimeEntry(ctx, gen.GetActiveTimeEntryParams{
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, timeentry.ErrNotFound
		}
		return nil, fmt.Errorf("db get active time entry: %w", err)
	}

	te := mapGenTimeEntryToDomain(row)
	return &te, nil
}

func (r *TimeEntryRepository) StopActive(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
) error {
	err := r.q.StopActiveTimeEntries(ctx, gen.StopActiveTimeEntriesParams{
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		return fmt.Errorf("db stop active time entries: %w", err)
	}
	return nil
}

func (r *TimeEntryRepository) Create(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	input timeentry.CreateInput,
) (*timeentry.TimeEntry, error) {
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

	row, err := r.q.CreateTimeEntry(ctx, gen.CreateTimeEntryParams{
		TicketID:        ticketIDUUID,
		Description:     input.Description,
		StartedAt:       startedAt,
		EndedAt:         endedAtTz,
		DurationSeconds: durI32,
		Billable:        billable,
		HourlyRate:      rateI32,
		WorkspaceID:     workspaceID,
		OwnerID:         ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, timeentry.ErrNotFound
		}
		return nil, fmt.Errorf("db create time entry: %w", err)
	}

	te := mapGenTimeEntryToDomain(row)
	return &te, nil
}

func (r *TimeEntryRepository) Stop(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*timeentry.TimeEntry, error) {
	row, err := r.q.StopTimeEntry(ctx, gen.StopTimeEntryParams{
		ID:          id,
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, timeentry.ErrAlreadyStopped
		}
		return nil, fmt.Errorf("db stop time entry: %w", err)
	}

	te := mapGenTimeEntryToDomain(row)
	return &te, nil
}

func (r *TimeEntryRepository) Update(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
	input timeentry.UpdateInput,
) (*timeentry.TimeEntry, error) {
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

	row, err := r.q.UpdateTimeEntry(ctx, gen.UpdateTimeEntryParams{
		TicketID:        ticketIDUUID,
		Description:     input.Description,
		StartedAt:       startedAtTz,
		EndedAt:         endedAtTz,
		DurationSeconds: durI32,
		Billable:        input.Billable,
		HourlyRate:      rateI32,
		ID:              id,
		WorkspaceID:     workspaceID,
		OwnerID:         ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, timeentry.ErrNotFound
		}
		return nil, fmt.Errorf("db update time entry: %w", err)
	}

	te := mapGenTimeEntryToDomain(row)
	return &te, nil
}

func (r *TimeEntryRepository) Delete(
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
		return fmt.Errorf("db delete time entry: %w", err)
	}
	if rowsAffected == 0 {
		return timeentry.ErrNotFound
	}
	return nil
}

func mapGenTimeEntryToDomain(row gen.TimeEntry) timeentry.TimeEntry {
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

	return timeentry.TimeEntry{
		ID:              row.ID,
		WorkspaceID:     row.WorkspaceID,
		TicketID:        ticketID,
		Description:     row.Description,
		StartedAt:       row.StartedAt,
		EndedAt:         endedAt,
		DurationSeconds: durationSeconds,
		Billable:        row.Billable,
		HourlyRate:      int(row.HourlyRate),
		CreatedAt:       row.CreatedAt,
		UpdatedAt:       row.UpdatedAt,
	}
}
