package track_test

import (
	"context"
	"io"
	"log/slog"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	appTrack "github.com/samSRaina/kizen/api/internal/application/track"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	domainTrack "github.com/samSRaina/kizen/api/internal/domain/track"
)

type mockTimeEntryRepo struct {
	mu      sync.Mutex
	entries map[uuid.UUID]*domainTrack.TimeEntry
}

func newMockTimeEntryRepo() *mockTimeEntryRepo {
	return &mockTimeEntryRepo{
		entries: make(map[uuid.UUID]*domainTrack.TimeEntry),
	}
}

func (m *mockTimeEntryRepo) ListByWorkspace(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	ticketID *uuid.UUID,
) ([]domainTrack.TimeEntry, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	var res []domainTrack.TimeEntry
	for _, e := range m.entries {
		if e.WorkspaceID == workspaceID {
			if ticketID == nil || (e.TicketID != nil && *e.TicketID == *ticketID) {
				res = append(res, *e)
			}
		}
	}
	return res, nil
}

func (m *mockTimeEntryRepo) GetByID(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*domainTrack.TimeEntry, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	e, ok := m.entries[id]
	if !ok || e.WorkspaceID != workspaceID {
		return nil, domainTrack.ErrNotFound
	}
	copied := *e
	return &copied, nil
}

func (m *mockTimeEntryRepo) GetActive(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
) (*domainTrack.TimeEntry, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, e := range m.entries {
		if e.WorkspaceID == workspaceID && (e.TimerState == domainTrack.TimerStateRunning || e.TimerState == domainTrack.TimerStatePaused) {
			copied := *e
			return &copied, nil
		}
	}
	return nil, domainTrack.ErrNotFound
}

func (m *mockTimeEntryRepo) StopActive(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := time.Now().UTC()
	for _, e := range m.entries {
		if e.WorkspaceID == workspaceID && (e.TimerState == domainTrack.TimerStateRunning || e.TimerState == domainTrack.TimerStatePaused) {
			e.TimerState = domainTrack.TimerStateStopped
			e.EndedAt = &now
			dur := int(now.Sub(e.StartedAt).Seconds())
			e.DurationSeconds = &dur
			e.UpdatedAt = now
		}
	}
	return nil
}

func (m *mockTimeEntryRepo) Create(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	input domainTrack.CreateInput,
) (*domainTrack.TimeEntry, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := time.Now().UTC()
	startedAt := now
	if input.StartedAt != nil {
		startedAt = *input.StartedAt
	}

	isManual := false
	if input.IsManual != nil {
		isManual = *input.IsManual
	}

	timerState := domainTrack.TimerStateStopped
	if input.TimerState != nil {
		timerState = *input.TimerState
	} else if !isManual && input.EndedAt == nil {
		timerState = domainTrack.TimerStateRunning
	}

	e := &domainTrack.TimeEntry{
		ID:              uuid.New(),
		WorkspaceID:     workspaceID,
		TicketID:        input.TicketID,
		Description:     input.Description,
		StartedAt:       startedAt,
		EndedAt:         input.EndedAt,
		DurationSeconds: input.DurationSeconds,
		Billable:        true,
		HourlyRate:      0,
		IsManual:        isManual,
		TimerState:      timerState,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	m.entries[e.ID] = e
	copied := *e
	return &copied, nil
}

func (m *mockTimeEntryRepo) Pause(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*domainTrack.TimeEntry, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	e, ok := m.entries[id]
	if !ok || e.WorkspaceID != workspaceID {
		return nil, domainTrack.ErrNotFound
	}
	if e.TimerState != domainTrack.TimerStateRunning {
		return nil, domainTrack.ErrNotRunning
	}

	now := time.Now().UTC()
	prevDur := 0
	if e.DurationSeconds != nil {
		prevDur = *e.DurationSeconds
	}
	dur := prevDur + int(now.Sub(e.UpdatedAt).Seconds())
	e.DurationSeconds = &dur
	e.TimerState = domainTrack.TimerStatePaused
	e.UpdatedAt = now

	copied := *e
	return &copied, nil
}

func (m *mockTimeEntryRepo) Resume(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*domainTrack.TimeEntry, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	e, ok := m.entries[id]
	if !ok || e.WorkspaceID != workspaceID {
		return nil, domainTrack.ErrNotFound
	}
	if e.TimerState != domainTrack.TimerStatePaused {
		return nil, domainTrack.ErrNotPaused
	}

	now := time.Now().UTC()
	e.TimerState = domainTrack.TimerStateRunning
	e.UpdatedAt = now

	copied := *e
	return &copied, nil
}

func (m *mockTimeEntryRepo) Stop(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*domainTrack.TimeEntry, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	e, ok := m.entries[id]
	if !ok || e.WorkspaceID != workspaceID {
		return nil, domainTrack.ErrNotFound
	}
	if e.TimerState == domainTrack.TimerStateStopped {
		return nil, domainTrack.ErrAlreadyStopped
	}

	now := time.Now().UTC()
	prevDur := 0
	if e.DurationSeconds != nil {
		prevDur = *e.DurationSeconds
	}
	if e.TimerState == domainTrack.TimerStateRunning {
		prevDur += int(now.Sub(e.UpdatedAt).Seconds())
	}
	e.DurationSeconds = &prevDur
	e.EndedAt = &now
	e.TimerState = domainTrack.TimerStateStopped
	e.UpdatedAt = now

	copied := *e
	return &copied, nil
}

func (m *mockTimeEntryRepo) Update(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
	input domainTrack.UpdateInput,
) (*domainTrack.TimeEntry, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	e, ok := m.entries[id]
	if !ok || e.WorkspaceID != workspaceID {
		return nil, domainTrack.ErrNotFound
	}
	if input.Description != nil {
		e.Description = input.Description
	}
	copied := *e
	return &copied, nil
}

func (m *mockTimeEntryRepo) Delete(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	delete(m.entries, id)
	return nil
}

func TestTimer_StartPauseResumeStop(t *testing.T) {
	ctx := context.Background()
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	repo := newMockTimeEntryRepo()
	service := appTrack.NewService(repo, logger)

	simTime := time.Date(2026, 11, 15, 10, 0, 0, 0, time.UTC)
	service.SetTimeProvider(func() time.Time {
		return simTime
	})

	caller := auth.Identity{UserID: "usr_1"}
	wsID := uuid.New()
	ticketA := uuid.New()
	desc := "implementing feature"

	// 1. Start live timer on Ticket A
	entryA, err := service.StartTimer(ctx, caller, wsID, &ticketA, &desc)
	if err != nil {
		t.Fatalf("failed to start timer: %v", err)
	}
	if !entryA.IsRunning() {
		t.Errorf("expected timer to be running")
	}
	if entryA.IsManual {
		t.Errorf("live timer must have is_manual = false")
	}

	// 2. Pause timer after 15 mins
	simTime = simTime.Add(15 * time.Minute)
	pausedEntry, err := service.Pause(ctx, caller, wsID, entryA.ID)
	if err != nil {
		t.Fatalf("failed to pause timer: %v", err)
	}
	if !pausedEntry.IsPaused() {
		t.Errorf("expected timer to be paused")
	}

	// Pausing again must return ErrAlreadyPaused
	_, err = service.Pause(ctx, caller, wsID, entryA.ID)
	if err == nil {
		t.Errorf("expected error when pausing already paused timer")
	}

	// 3. Resume timer
	simTime = simTime.Add(5 * time.Minute)
	resumedEntry, err := service.Resume(ctx, caller, wsID, entryA.ID)
	if err != nil {
		t.Fatalf("failed to resume timer: %v", err)
	}
	if !resumedEntry.IsRunning() {
		t.Errorf("expected timer to be running after resume")
	}

	// 4. Completely Stop timer
	simTime = simTime.Add(30 * time.Minute)
	stoppedEntry, err := service.Stop(ctx, caller, wsID, entryA.ID)
	if err != nil {
		t.Fatalf("failed to stop timer: %v", err)
	}
	if !stoppedEntry.IsStopped() {
		t.Errorf("expected timer to be stopped")
	}
	if stoppedEntry.EndedAt == nil {
		t.Errorf("expected ended_at to be populated")
	}

	// Stopping again must return ErrAlreadyStopped
	_, err = service.Stop(ctx, caller, wsID, entryA.ID)
	if err == nil {
		t.Errorf("expected error when stopping already stopped timer")
	}
}

func TestManualEntry_Flagging(t *testing.T) {
	ctx := context.Background()
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	repo := newMockTimeEntryRepo()
	service := appTrack.NewService(repo, logger)

	caller := auth.Identity{UserID: "usr_1"}
	wsID := uuid.New()
	startTime := time.Date(2026, 11, 14, 10, 0, 0, 0, time.UTC)
	endTime := startTime.Add(2 * time.Hour)
	dur := 7200

	// 1. Create a retrospective manual entry
	manualEntry, err := service.Create(ctx, caller, wsID, domainTrack.CreateInput{
		StartedAt:       &startTime,
		EndedAt:         &endTime,
		DurationSeconds: &dur,
	})
	if err != nil {
		t.Fatalf("failed to create manual entry: %v", err)
	}

	if !manualEntry.IsManual {
		t.Errorf("expected entry to be automatically flagged as manual")
	}
	if !manualEntry.IsStopped() {
		t.Errorf("manual entry should be created in stopped state")
	}

	// Attempting to pause or resume a manual entry must fail with ErrManualNoTimer
	_, err = service.Pause(ctx, caller, wsID, manualEntry.ID)
	if err == nil {
		t.Errorf("expected error when pausing a manual entry")
	}
}
