package handler_test

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
	"github.com/samSRaina/kizen/api/internal/transport/http/gen"
	"github.com/samSRaina/kizen/api/internal/transport/http/handler"
	"github.com/samSRaina/kizen/api/internal/transport/http/middleware"
)

type mockTrackRepo struct {
	mu      sync.Mutex
	entries map[uuid.UUID]*domainTrack.Track
}

func newMockTrackRepo() *mockTrackRepo {
	return &mockTrackRepo{
		entries: make(map[uuid.UUID]*domainTrack.Track),
	}
}

func (m *mockTrackRepo) ListByWorkspace(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	ticketID *uuid.UUID,
) ([]domainTrack.Track, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	var res []domainTrack.Track
	for _, e := range m.entries {
		if e.WorkspaceID == workspaceID {
			if ticketID == nil || (e.TicketID != nil && *e.TicketID == *ticketID) {
				res = append(res, *e)
			}
		}
	}
	return res, nil
}

func (m *mockTrackRepo) GetByID(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*domainTrack.Track, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	e, ok := m.entries[id]
	if !ok || e.WorkspaceID != workspaceID {
		return nil, domainTrack.ErrNotFound
	}
	copied := *e
	return &copied, nil
}

func (m *mockTrackRepo) GetActive(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
) (*domainTrack.Track, error) {
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

func (m *mockTrackRepo) StopActive(
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

func (m *mockTrackRepo) Create(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	input domainTrack.CreateInput,
) (*domainTrack.Track, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	id := uuid.New()
	now := time.Now().UTC()

	var startedAt time.Time
	if input.StartedAt != nil {
		startedAt = *input.StartedAt
	} else {
		startedAt = now
	}

	isManual := false
	if input.IsManual != nil {
		isManual = *input.IsManual
	}

	timerState := domainTrack.TimerStateStopped
	if input.TimerState != nil {
		timerState = *input.TimerState
	}

	billable := false
	if input.Billable != nil {
		billable = *input.Billable
	}

	hourlyRate := 0
	if input.HourlyRate != nil {
		hourlyRate = *input.HourlyRate
	}

	entry := &domainTrack.Track{
		ID:              id,
		WorkspaceID:     workspaceID,
		TicketID:        input.TicketID,
		Description:     input.Description,
		StartedAt:       startedAt,
		EndedAt:         input.EndedAt,
		DurationSeconds: input.DurationSeconds,
		Billable:        billable,
		HourlyRate:      hourlyRate,
		IsManual:        isManual,
		TimerState:      timerState,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	m.entries[id] = entry
	copied := *entry
	return &copied, nil
}

func (m *mockTrackRepo) Update(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
	input domainTrack.UpdateInput,
) (*domainTrack.Track, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	e, ok := m.entries[id]
	if !ok || e.WorkspaceID != workspaceID {
		return nil, domainTrack.ErrNotFound
	}

	if input.Description != nil {
		e.Description = input.Description
	}
	if input.DurationSeconds != nil {
		e.DurationSeconds = input.DurationSeconds
	}
	if input.Billable != nil {
		e.Billable = *input.Billable
	}
	if input.HourlyRate != nil {
		e.HourlyRate = *input.HourlyRate
	}
	if input.TimerState != nil {
		e.TimerState = *input.TimerState
	}
	if input.EndedAt != nil {
		e.EndedAt = input.EndedAt
	}
	e.UpdatedAt = time.Now().UTC()
	copied := *e
	return &copied, nil
}

func (m *mockTrackRepo) Pause(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*domainTrack.Track, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	e, ok := m.entries[id]
	if !ok || e.WorkspaceID != workspaceID {
		return nil, domainTrack.ErrNotFound
	}
	if e.TimerState != domainTrack.TimerStateRunning {
		return nil, domainTrack.ErrNotRunning
	}
	e.TimerState = domainTrack.TimerStatePaused
	e.UpdatedAt = time.Now().UTC()
	copied := *e
	return &copied, nil
}

func (m *mockTrackRepo) Resume(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*domainTrack.Track, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	e, ok := m.entries[id]
	if !ok || e.WorkspaceID != workspaceID {
		return nil, domainTrack.ErrNotFound
	}
	if e.TimerState != domainTrack.TimerStatePaused {
		return nil, domainTrack.ErrNotPaused
	}
	e.TimerState = domainTrack.TimerStateRunning
	e.UpdatedAt = time.Now().UTC()
	copied := *e
	return &copied, nil
}

func (m *mockTrackRepo) Stop(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) (*domainTrack.Track, error) {
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
	e.TimerState = domainTrack.TimerStateStopped
	e.EndedAt = &now
	dur := int(now.Sub(e.StartedAt).Seconds())
	e.DurationSeconds = &dur
	e.UpdatedAt = now
	copied := *e
	return &copied, nil
}

func (m *mockTrackRepo) Delete(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	id uuid.UUID,
) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	e, ok := m.entries[id]
	if !ok || e.WorkspaceID != workspaceID {
		return domainTrack.ErrNotFound
	}
	delete(m.entries, id)
	return nil
}

func TestTrackHandler_CreateAndList(t *testing.T) {
	repo := newMockTrackRepo()
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	service := appTrack.NewService(repo, logger)
	h := handler.NewTrackHandler(service)

	caller := auth.Principal{UserID: "usr_test"}
	ctx := middleware.WithPrincipal(context.Background(), &caller)

	wsID := uuid.New()
	desc := "Work on task"
	dur := 1800
	billable := true

	// 1. Create manual entry via HTTP handler
	createResp, err := h.CreateTrack(ctx, gen.CreateTrackRequestObject{
		WorkspaceId: wsID,
		Body: &gen.CreateTrackJSONRequestBody{
			Description:     &desc,
			DurationSeconds: &dur,
			Billable:        &billable,
		},
	})
	if err != nil {
		t.Fatalf("create handler returned error: %v", err)
	}

	jsonResp, ok := createResp.(gen.CreateTrack201JSONResponse)
	if !ok {
		t.Fatalf("expected 201 response, got %T", createResp)
	}
	if jsonResp.Description == nil || *jsonResp.Description != desc {
		t.Errorf("expected description %q, got %v", desc, jsonResp.Description)
	}

	// 2. List tracks via HTTP handler
	listResp, err := h.ListTracks(ctx, gen.ListTracksRequestObject{
		WorkspaceId: wsID,
		Params:      gen.ListTracksParams{},
	})
	if err != nil {
		t.Fatalf("list handler returned error: %v", err)
	}

	listJSON, ok := listResp.(gen.ListTracks200JSONResponse)
	if !ok {
		t.Fatalf("expected 200 list response, got %T", listResp)
	}
	if len(listJSON) != 1 {
		t.Errorf("expected 1 item, got %d", len(listJSON))
	}
}

func TestTrackHandler_PauseResumeStop(t *testing.T) {
	repo := newMockTrackRepo()
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	service := appTrack.NewService(repo, logger)
	h := handler.NewTrackHandler(service)

	caller := auth.Principal{UserID: "usr_test"}
	ctx := middleware.WithPrincipal(context.Background(), &caller)

	wsID := uuid.New()

	// 1. Start a live timer
	entry, err := service.StartTimer(ctx, wsID, nil, nil)
	if err != nil {
		t.Fatalf("failed to start timer: %v", err)
	}

	// 2. Pause via HTTP handler
	pauseResp, err := h.PauseTrack(ctx, gen.PauseTrackRequestObject{
		WorkspaceId: wsID,
		Id:          entry.ID,
	})
	if err != nil {
		t.Fatalf("pause handler returned error: %v", err)
	}

	jsonResp, ok := pauseResp.(gen.PauseTrack200JSONResponse)
	if !ok {
		t.Fatalf("expected 200 JSON response, got %T", pauseResp)
	}
	if jsonResp.TimerState == nil || *jsonResp.TimerState != gen.TrackTimerStatePaused {
		t.Errorf("expected timer state paused, got %v", jsonResp.TimerState)
	}

	// 3. Resume via HTTP handler
	resumeResp, err := h.ResumeTrack(ctx, gen.ResumeTrackRequestObject{
		WorkspaceId: wsID,
		Id:          entry.ID,
	})
	if err != nil {
		t.Fatalf("resume handler returned error: %v", err)
	}

	resumeJSON, ok := resumeResp.(gen.ResumeTrack200JSONResponse)
	if !ok {
		t.Fatalf("expected 200 JSON response, got %T", resumeResp)
	}
	if resumeJSON.TimerState == nil || *resumeJSON.TimerState != gen.TrackTimerStateRunning {
		t.Errorf("expected timer state running, got %v", resumeJSON.TimerState)
	}

	// 4. Stop via HTTP handler
	stopResp, err := h.StopTrack(ctx, gen.StopTrackRequestObject{
		WorkspaceId: wsID,
		Id:          entry.ID,
	})
	if err != nil {
		t.Fatalf("stop handler returned error: %v", err)
	}

	stopJSON, ok := stopResp.(gen.StopTrack200JSONResponse)
	if !ok {
		t.Fatalf("expected 200 JSON response, got %T", stopResp)
	}
	if stopJSON.TimerState == nil || *stopJSON.TimerState != gen.TrackTimerStateStopped {
		t.Errorf("expected timer state stopped, got %v", stopJSON.TimerState)
	}
}
