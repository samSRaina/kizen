package handler_test

import (
	"context"
	"io"
	"log/slog"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	appProject "github.com/samSRaina/kizen/api/internal/application/project"
	appTicket "github.com/samSRaina/kizen/api/internal/application/ticket"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	domainProject "github.com/samSRaina/kizen/api/internal/domain/project"
	domainTicket "github.com/samSRaina/kizen/api/internal/domain/ticket"
	"github.com/samSRaina/kizen/api/internal/transport/http/gen"
	"github.com/samSRaina/kizen/api/internal/transport/http/handler"
	"github.com/samSRaina/kizen/api/internal/transport/http/middleware"
)

type mockProjectRepo struct {
	mu       sync.Mutex
	projects map[uuid.UUID]*domainProject.Project
}

func newMockProjectRepo() *mockProjectRepo {
	return &mockProjectRepo{
		projects: make(map[uuid.UUID]*domainProject.Project),
	}
}

func (m *mockProjectRepo) Create(ctx context.Context, ownerID auth.UserID, input domainProject.CreateInput) (*domainProject.Project, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, p := range m.projects {
		if p.WorkspaceID == input.WorkspaceID && p.Name == input.Name && p.DeletedAt == nil {
			return nil, domainProject.ErrDuplicateName
		}
	}

	prj := &domainProject.Project{
		ID:                uuid.New(),
		WorkspaceID:       input.WorkspaceID,
		Name:              input.Name,
		TicketIDPrefix:    input.TicketIDPrefix,
		Settings:          input.Settings,
		DefaultHourlyRate: input.DefaultHourlyRate,
		Description:       input.Description,
		CreatedAt:         time.Now().UTC(),
		UpdatedAt:         time.Now().UTC(),
	}
	m.projects[prj.ID] = prj
	return prj, nil
}

func (m *mockProjectRepo) ListByWorkspace(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID) ([]domainProject.Project, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	var res []domainProject.Project
	for _, p := range m.projects {
		if p.WorkspaceID == workspaceID && p.DeletedAt == nil {
			res = append(res, *p)
		}
	}
	return res, nil
}

func (m *mockProjectRepo) GetByID(ctx context.Context, ownerID auth.UserID, workspaceID, projectID uuid.UUID) (*domainProject.Project, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	p, ok := m.projects[projectID]
	if !ok || p.WorkspaceID != workspaceID || p.DeletedAt != nil {
		return nil, domainProject.ErrNotFound
	}
	return p, nil
}

func (m *mockProjectRepo) Update(ctx context.Context, ownerID auth.UserID, workspaceID, projectID uuid.UUID, input domainProject.UpdateInput) (*domainProject.Project, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	p, ok := m.projects[projectID]
	if !ok || p.WorkspaceID != workspaceID || p.DeletedAt != nil {
		return nil, domainProject.ErrNotFound
	}

	if input.Name != nil {
		for _, other := range m.projects {
			if other.ID != projectID && other.WorkspaceID == workspaceID && other.Name == *input.Name && other.DeletedAt == nil {
				return nil, domainProject.ErrDuplicateName
			}
		}
		p.Name = *input.Name
	}
	if input.TicketIDPrefix != nil {
		p.TicketIDPrefix = *input.TicketIDPrefix
	}
	if input.DefaultHourlyRate != nil {
		p.DefaultHourlyRate = *input.DefaultHourlyRate
	}
	if input.Description != nil {
		p.Description = input.Description
	}
	if input.Settings != nil {
		p.Settings = input.Settings
	}
	p.UpdatedAt = time.Now().UTC()
	return p, nil
}

func (m *mockProjectRepo) Delete(ctx context.Context, ownerID auth.UserID, workspaceID, projectID uuid.UUID) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	p, ok := m.projects[projectID]
	if !ok || p.WorkspaceID != workspaceID || p.DeletedAt != nil {
		return domainProject.ErrNotFound
	}
	now := time.Now().UTC()
	p.DeletedAt = &now
	return nil
}

type mockTicketRepo struct {
	mu      sync.Mutex
	tickets map[uuid.UUID]*domainTicket.Ticket
	seq     int64
}

func newMockTicketRepo() *mockTicketRepo {
	return &mockTicketRepo{
		tickets: make(map[uuid.UUID]*domainTicket.Ticket),
	}
}

func (m *mockTicketRepo) ListByWorkspace(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID) ([]domainTicket.Ticket, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	var res []domainTicket.Ticket
	for _, t := range m.tickets {
		res = append(res, *t)
	}
	return res, nil
}

func (m *mockTicketRepo) ListByProject(ctx context.Context, ownerID auth.UserID, workspaceID, projectID uuid.UUID) ([]domainTicket.Ticket, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	var res []domainTicket.Ticket
	for _, t := range m.tickets {
		if t.ProjectID == projectID {
			res = append(res, *t)
		}
	}
	return res, nil
}

func (m *mockTicketRepo) GetByIdentifier(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, identifier string) (*domainTicket.Ticket, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, t := range m.tickets {
		if t.Identifier == identifier {
			return t, nil
		}
	}
	return nil, domainTicket.ErrNotFound
}

func (m *mockTicketRepo) GetByProjectAndIdentifier(ctx context.Context, ownerID auth.UserID, workspaceID, projectID uuid.UUID, identifier string) (*domainTicket.Ticket, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, t := range m.tickets {
		if t.ProjectID == projectID && t.Identifier == identifier {
			return t, nil
		}
	}
	return nil, domainTicket.ErrNotFound
}

func (m *mockTicketRepo) Create(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, input domainTicket.CreateInput) (*domainTicket.Ticket, error) {
	projectID := uuid.New()
	if input.ProjectID != nil {
		projectID = *input.ProjectID
	}
	return m.CreateForProject(ctx, ownerID, workspaceID, projectID, input)
}

func (m *mockTicketRepo) CreateForProject(ctx context.Context, ownerID auth.UserID, workspaceID, projectID uuid.UUID, input domainTicket.CreateInput) (*domainTicket.Ticket, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.seq++
	t := &domainTicket.Ticket{
		ID:          uuid.New(),
		ProjectID:   projectID,
		Identifier:  "TEST-1",
		Title:       input.Title,
		Description: input.Description,
		Type:        input.Type,
		Status:      domainTicket.StatusTodo,
		Priority:    input.Priority,
		Points:      input.Points,
		Tags:        input.Tags,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
	m.tickets[t.ID] = t
	return t, nil
}

func (m *mockTicketRepo) Update(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, identifier string, input domainTicket.UpdateInput) (*domainTicket.Ticket, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, t := range m.tickets {
		if t.Identifier == identifier {
			if input.Title != nil {
				t.Title = *input.Title
			}
			t.UpdatedAt = time.Now().UTC()
			return t, nil
		}
	}
	return nil, domainTicket.ErrNotFound
}

func (m *mockTicketRepo) Delete(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, identifier string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	for id, t := range m.tickets {
		if t.Identifier == identifier {
			delete(m.tickets, id)
			return nil
		}
	}
	return domainTicket.ErrNotFound
}

func TestProjectHandler_Lifecycle(t *testing.T) {
	discardLogger := slog.New(slog.NewTextHandler(io.Discard, nil))
	repo := newMockProjectRepo()
	svc := appProject.NewService(repo, discardLogger)
	h := handler.NewProjectHandler(svc)

	wsID := uuid.New()
	userCaller := auth.Principal{UserID: "test_user_1"}
	authCtx := middleware.WithPrincipal(context.Background(), &userCaller)

	// 1. Unauthenticated test
	unauthResp, err := h.ListProjects(context.Background(), gen.ListProjectsRequestObject{WorkspaceId: wsID})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := unauthResp.(gen.ListProjects401ApplicationProblemPlusJSONResponse); !ok {
		t.Fatalf("expected 401 response, got %T", unauthResp)
	}

	// 2. Create Project
	rate := 100
	desc := "Core backend project"
	prefix := "BACK"
	createResp, err := h.CreateProject(authCtx, gen.CreateProjectRequestObject{
		WorkspaceId: wsID,
		Body: &gen.CreateProjectRequest{
			Name:              "Backend Project",
			TicketIdPrefix:    &prefix,
			DefaultHourlyRate: &rate,
			Description:       &desc,
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	created201, ok := createResp.(gen.CreateProject201JSONResponse)
	if !ok {
		t.Fatalf("expected 201 response, got %T", createResp)
	}
	if created201.Name != "Backend Project" || created201.TicketIdPrefix != "BACK" {
		t.Fatalf("unexpected project details: %+v", created201)
	}

	// 3. Duplicate Project Creation -> 409
	dupResp, err := h.CreateProject(authCtx, gen.CreateProjectRequestObject{
		WorkspaceId: wsID,
		Body: &gen.CreateProjectRequest{
			Name: "Backend Project",
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := dupResp.(gen.CreateProject409ApplicationProblemPlusJSONResponse); !ok {
		t.Fatalf("expected 409 conflict, got %T", dupResp)
	}

	// 4. List Projects
	listResp, err := h.ListProjects(authCtx, gen.ListProjectsRequestObject{WorkspaceId: wsID})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	list200, ok := listResp.(gen.ListProjects200JSONResponse)
	if !ok || len(list200) != 1 {
		t.Fatalf("expected list of 1 project, got %T with len %d", listResp, len(list200))
	}

	// 5. Get Project
	getResp, err := h.GetProject(authCtx, gen.GetProjectRequestObject{
		WorkspaceId: wsID,
		ProjectId:   created201.Id,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	get200, ok := getResp.(gen.GetProject200JSONResponse)
	if !ok || get200.Id != created201.Id {
		t.Fatalf("expected project %s, got %+v", created201.Id, getResp)
	}

	// 6. Update Project
	newName := "Backend Core"
	updateResp, err := h.UpdateProject(authCtx, gen.UpdateProjectRequestObject{
		WorkspaceId: wsID,
		ProjectId:   created201.Id,
		Body: &gen.UpdateProjectRequest{
			Name: &newName,
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	update200, ok := updateResp.(gen.UpdateProject200JSONResponse)
	if !ok || update200.Name != "Backend Core" {
		t.Fatalf("expected updated name, got %+v", updateResp)
	}

	// 7. Delete Project
	delResp, err := h.DeleteProject(authCtx, gen.DeleteProjectRequestObject{
		WorkspaceId: wsID,
		ProjectId:   created201.Id,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := delResp.(gen.DeleteProject204Response); !ok {
		t.Fatalf("expected 204 deleted, got %T", delResp)
	}

	// 8. Get Project after delete -> 404
	afterDelResp, err := h.GetProject(authCtx, gen.GetProjectRequestObject{
		WorkspaceId: wsID,
		ProjectId:   created201.Id,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := afterDelResp.(gen.GetProject404ApplicationProblemPlusJSONResponse); !ok {
		t.Fatalf("expected 404 after delete, got %T", afterDelResp)
	}
}

func TestProjectTicketsHandler_Lifecycle(t *testing.T) {
	discardLogger := slog.New(slog.NewTextHandler(io.Discard, nil))
	repo := newMockTicketRepo()
	svc := appTicket.NewService(repo, discardLogger)
	h := handler.NewTicketHandler(svc)

	wsID := uuid.New()
	projectID := uuid.New()
	userCaller := auth.Principal{UserID: "test_user_1"}
	authCtx := middleware.WithPrincipal(context.Background(), &userCaller)

	// 1. Create ticket under project
	createResp, err := h.CreateTicket(authCtx, gen.CreateTicketRequestObject{
		WorkspaceId: wsID,
		ProjectId:   projectID,
		Body: &gen.CreateTicketRequest{
			Title:    "Setup CI/CD pipeline",
			Type:     gen.Task,
			Priority: gen.High,
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	created201, ok := createResp.(gen.CreateTicket201JSONResponse)
	if !ok {
		t.Fatalf("expected 201 created, got %T", createResp)
	}
	if created201.ProjectId != projectID {
		t.Fatalf("expected project id %s, got %s", projectID, created201.ProjectId)
	}

	// 2. List tickets by project
	listResp, err := h.ListTickets(authCtx, gen.ListTicketsRequestObject{
		WorkspaceId: wsID,
		ProjectId:   projectID,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	list200, ok := listResp.(gen.ListTickets200JSONResponse)
	if !ok || len(list200) != 1 {
		t.Fatalf("expected 1 ticket in project, got %d", len(list200))
	}

	// 3. Get project ticket
	getResp, err := h.GetTicket(authCtx, gen.GetTicketRequestObject{
		WorkspaceId: wsID,
		ProjectId:   projectID,
		Identifier:  "TEST-1",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := getResp.(gen.GetTicket200JSONResponse); !ok {
		t.Fatalf("expected 200 got %T", getResp)
	}

	// 4. Delete project ticket
	delResp, err := h.DeleteTicket(authCtx, gen.DeleteTicketRequestObject{
		WorkspaceId: wsID,
		ProjectId:   projectID,
		Identifier:  "TEST-1",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := delResp.(gen.DeleteTicket204Response); !ok {
		t.Fatalf("expected 204 deleted, got %T", delResp)
	}
}
