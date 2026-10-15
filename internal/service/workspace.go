package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"

	"github.com/samSRaina/kizen/internal/domain/auth"
	"github.com/samSRaina/kizen/internal/domain/workspace"
	repository "github.com/samSRaina/kizen/internal/repository/postgres"
)

var (
	ErrInvalidInput = errors.New("invalid input data")
	ErrNotFound     = repository.ErrNotFound
)

type WorkspaceService interface {
	List(ctx context.Context, caller auth.Identity) ([]workspace.Workspace, error)
	Create(ctx context.Context, caller auth.Identity, input workspace.CreateWorkspaceInput) (*workspace.Workspace, error)
	Delete(ctx context.Context, caller auth.Identity, id uuid.UUID) error
}

type workspaceService struct {
	repo repository.WorkspaceRepository
}

func NewWorkspaceService(repo repository.WorkspaceRepository) WorkspaceService {
	return &workspaceService{repo: repo}
}

func (s *workspaceService) List(ctx context.Context, caller auth.Identity) ([]workspace.Workspace, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	return s.repo.ListByUser(ctx, caller)
}

func (s *workspaceService) Create(ctx context.Context, caller auth.Identity, input workspace.CreateWorkspaceInput) (*workspace.Workspace, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}

	trimmedName := strings.TrimSpace(input.Name)
	if trimmedName == "" {
		return nil, fmt.Errorf("%w: workspace name is required", ErrInvalidInput)
	}
	input.Name = trimmedName

	if input.DefaultHourlyRate < 0 {
		return nil, fmt.Errorf("%w: default hourly rate cannot be negative", ErrInvalidInput)
	}

	return s.repo.Create(ctx, caller, input)
}

func (s *workspaceService) Delete(ctx context.Context, caller auth.Identity, id uuid.UUID) error {
	if caller.UserID == "" {
		return auth.ErrUnauthenticated
	}
	if id == uuid.Nil {
		return ErrInvalidInput
	}
	return s.repo.Delete(ctx, caller, id)
}
