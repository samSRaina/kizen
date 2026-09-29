package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/services/workspace/internal/domain"
	"github.com/samSRaina/kizen/services/workspace/internal/service"
)

type mockRepository struct {
	listFn   func(ctx context.Context) ([]domain.Workspace, error)
	createFn func(ctx context.Context, ws domain.CreateWorkspaceInput) (*domain.Workspace, error)
	deleteFn func(ctx context.Context, id uuid.UUID) error
}

func (m *mockRepository) List(ctx context.Context) ([]domain.Workspace, error) {
	if m.listFn != nil {
		return m.listFn(ctx)
	}
	return nil, nil
}

func (m *mockRepository) Create(ctx context.Context, ws domain.CreateWorkspaceInput) (*domain.Workspace, error) {
	if m.createFn != nil {
		return m.createFn(ctx, ws)
	}
	return nil, nil
}

func (m *mockRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if m.deleteFn != nil {
		return m.deleteFn(ctx, id)
	}
	return nil
}

func TestService_List(t *testing.T) {
	ctx := context.Background()

	t.Run("success", func(t *testing.T) {
		repo := &mockRepository{
			listFn: func(ctx context.Context) ([]domain.Workspace, error) {
				return []domain.Workspace{
					{ID: uuid.New(), Name: "Workspace 1"},
				}, nil
			},
		}
		s := service.NewService(repo)

		workspaces, err := s.List(ctx)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(workspaces) != 1 {
			t.Fatalf("expected 1 workspace, got %d", len(workspaces))
		}
	})

	t.Run("repository error", func(t *testing.T) {
		repo := &mockRepository{
			listFn: func(ctx context.Context) ([]domain.Workspace, error) {
				return nil, errors.New("db error")
			},
		}
		s := service.NewService(repo)

		_, err := s.List(ctx)
		if err == nil {
			t.Fatal("expected error, got nil")
		}
	})
}

func TestService_Create(t *testing.T) {
	ctx := context.Background()

	t.Run("success", func(t *testing.T) {
		in := domain.CreateWorkspaceInput{
			Name:              "New Workspace",
			DefaultHourlyRate: 100,
		}

		repo := &mockRepository{
			createFn: func(ctx context.Context, ws domain.CreateWorkspaceInput) (*domain.Workspace, error) {
				return &domain.Workspace{
					ID:                uuid.New(),
					Name:              ws.Name,
					DefaultHourlyRate: ws.DefaultHourlyRate,
					CreatedAt:         time.Now(),
					UpdatedAt:         time.Now(),
				}, nil
			},
		}
		s := service.NewService(repo)

		created, err := s.Create(ctx, in)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if created.Name != "New Workspace" {
			t.Fatalf("expected name to match")
		}
	})

	t.Run("validation error - empty name", func(t *testing.T) {
		in := domain.CreateWorkspaceInput{
			Name:              "",
			DefaultHourlyRate: 100,
		}
		s := service.NewService(&mockRepository{})
		_, err := s.Create(ctx, in)
		if !errors.Is(err, domain.ErrInvalidInput) {
			t.Fatalf("expected ErrInvalidInput, got %v", err)
		}
	})

	t.Run("validation error - negative rate", func(t *testing.T) {
		in := domain.CreateWorkspaceInput{
			Name:              "Test",
			DefaultHourlyRate: -50,
		}
		s := service.NewService(&mockRepository{})
		_, err := s.Create(ctx, in)
		if !errors.Is(err, domain.ErrInvalidInput) {
			t.Fatalf("expected ErrInvalidInput, got %v", err)
		}
	})
}
