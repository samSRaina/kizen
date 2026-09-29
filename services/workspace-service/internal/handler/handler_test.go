package handler_test

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/internal/middleware"
	"github.com/samSRaina/kizen/services/workspace-service/internal/api"
	"github.com/samSRaina/kizen/services/workspace-service/internal/domain"
	"github.com/samSRaina/kizen/services/workspace-service/internal/handler"
)

type mockService struct {
	listFn   func(ctx context.Context) ([]domain.Workspace, error)
	createFn func(ctx context.Context, in domain.CreateWorkspaceInput) (*domain.Workspace, error)
	deleteFn func(ctx context.Context, id uuid.UUID) error
}

func (m *mockService) List(ctx context.Context) ([]domain.Workspace, error) {
	if m.listFn != nil {
		return m.listFn(ctx)
	}
	return nil, nil
}

func (m *mockService) Create(ctx context.Context, in domain.CreateWorkspaceInput) (*domain.Workspace, error) {
	if m.createFn != nil {
		return m.createFn(ctx, in)
	}
	return nil, nil
}

func (m *mockService) Delete(ctx context.Context, id uuid.UUID) error {
	if m.deleteFn != nil {
		return m.deleteFn(ctx, id)
	}
	return nil
}

func TestHandler_ListWorkspaces(t *testing.T) {
	t.Run("unauthorized", func(t *testing.T) {
		h := handler.NewHandler(&mockService{})
		ctx := context.Background()

		resp, err := h.ListWorkspaces(ctx, api.ListWorkspacesRequestObject{})
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		_, ok := resp.(api.ListWorkspaces401ApplicationProblemPlusJSONResponse)
		if !ok {
			t.Fatalf("expected 401 response, got %T", resp)
		}
	})

	t.Run("success", func(t *testing.T) {
		mock := &mockService{
			listFn: func(ctx context.Context) ([]domain.Workspace, error) {
				return []domain.Workspace{{ID: uuid.New(), Name: "Test WS"}}, nil
			},
		}
		h := handler.NewHandler(mock)
		ctx := middleware.WithUserID(context.Background(), "user123")

		resp, err := h.ListWorkspaces(ctx, api.ListWorkspacesRequestObject{})
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		res, ok := resp.(api.ListWorkspaces200JSONResponse)
		if !ok {
			t.Fatalf("expected 200 response, got %T", resp)
		}
		if len(res) != 1 {
			t.Fatalf("expected 1 item, got %d", len(res))
		}
	})

	t.Run("service error", func(t *testing.T) {
		h := handler.NewHandler(&mockService{
			listFn: func(ctx context.Context) ([]domain.Workspace, error) {
				return nil, errors.New("internal logic error")
			},
		})
		ctx := middleware.WithUserID(context.Background(), "user123")

		_, err := h.ListWorkspaces(ctx, api.ListWorkspacesRequestObject{})
		if err == nil {
			t.Fatalf("expected error from handler wrapper")
		}
	})
}

func TestHandler_CreateWorkspace(t *testing.T) {
	t.Run("unauthorized", func(t *testing.T) {
		h := handler.NewHandler(&mockService{})
		ctx := context.Background()

		resp, err := h.CreateWorkspace(ctx, api.CreateWorkspaceRequestObject{})
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		_, ok := resp.(api.CreateWorkspace401ApplicationProblemPlusJSONResponse)
		if !ok {
			t.Fatalf("expected 401 response")
		}
	})

	t.Run("success", func(t *testing.T) {
		mock := &mockService{
			createFn: func(ctx context.Context, in domain.CreateWorkspaceInput) (*domain.Workspace, error) {
				if in.Name != "My Workspace" {
					t.Fatalf("expected My Workspace, got %s", in.Name)
				}
				return &domain.Workspace{
					ID:                uuid.New(),
					Name:              in.Name,
					DefaultHourlyRate: in.DefaultHourlyRate,
				}, nil
			},
		}
		h := handler.NewHandler(mock)
		ctx := middleware.WithUserID(context.Background(), "user123")

		body := &api.CreateWorkspaceJSONRequestBody{
			Name:              "My Workspace",
			DefaultHourlyRate: 150,
		}

		resp, err := h.CreateWorkspace(ctx, api.CreateWorkspaceRequestObject{Body: body})
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		_, ok := resp.(api.CreateWorkspace201JSONResponse)
		if !ok {
			t.Fatalf("expected 201 response, got %T", resp)
		}
	})

	t.Run("bad request - invalid input", func(t *testing.T) {
		h := handler.NewHandler(&mockService{
			createFn: func(ctx context.Context, in domain.CreateWorkspaceInput) (*domain.Workspace, error) {
				return nil, domain.ErrInvalidInput
			},
		})
		ctx := middleware.WithUserID(context.Background(), "user123")

		body := &api.CreateWorkspaceJSONRequestBody{Name: ""}
		resp, err := h.CreateWorkspace(ctx, api.CreateWorkspaceRequestObject{Body: body})
		if err != nil {
			t.Fatalf("expected no error wrapper, got %v", err)
		}

		_, ok := resp.(api.CreateWorkspace400ApplicationProblemPlusJSONResponse)
		if !ok {
			t.Fatalf("expected 400 response")
		}
	})
}
