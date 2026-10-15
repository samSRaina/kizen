package workspace

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/application/ports"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/workspace"
)

// Service coordinates business use cases for workspace management.
type Service struct {
	repo ports.WorkspaceRepository
	log  *slog.Logger
}

// NewService constructs a WorkspaceService. It accepts the port interface and returns a concrete pointer.
func NewService(repo ports.WorkspaceRepository, log *slog.Logger) *Service {
	return &Service{
		repo: repo,
		log:  log,
	}
}

// List retrieves all workspaces owned by the authenticated caller.
func (s *Service) List(ctx context.Context, caller auth.Identity) ([]workspace.Workspace, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}

	workspaces, err := s.repo.ListByUser(ctx, caller.UserID)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to list workspaces",
			slog.String("user_id", caller.UserID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("listing workspaces: %w", err)
	}

	return workspaces, nil
}

// GetByID retrieves a single workspace if owned by the caller.
func (s *Service) GetByID(ctx context.Context, caller auth.Identity, id uuid.UUID) (*workspace.Workspace, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", workspace.ErrInvalidInput)
	}

	ws, err := s.repo.GetByID(ctx, caller.UserID, id)
	if err != nil {
		return nil, err
	}

	return ws, nil
}

// Create validates business invariants and persists a new workspace.
func (s *Service) Create(ctx context.Context, caller auth.Identity, input workspace.CreateInput) (*workspace.Workspace, error) {
	if caller.UserID == "" {
		return nil, auth.ErrUnauthenticated
	}

	// Pure domain validation
	if err := input.Validate(); err != nil {
		return nil, err
	}

	ws, err := s.repo.Create(ctx, caller.UserID, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to create workspace",
			slog.String("user_id", caller.UserID.String()),
			slog.String("name", input.Name),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("creating workspace: %w", err)
	}

	s.log.InfoContext(ctx, "workspace created successfully",
		slog.String("workspace_id", ws.ID.String()),
		slog.String("user_id", caller.UserID.String()),
	)

	return ws, nil
}

// Delete removes a workspace owned by the caller.
func (s *Service) Delete(ctx context.Context, caller auth.Identity, id uuid.UUID) error {
	if caller.UserID == "" {
		return auth.ErrUnauthenticated
	}
	if id == uuid.Nil {
		return fmt.Errorf("%w: invalid workspace uuid", workspace.ErrInvalidInput)
	}

	if err := s.repo.Delete(ctx, caller.UserID, id); err != nil {
		s.log.ErrorContext(ctx, "failed to delete workspace",
			slog.String("workspace_id", id.String()),
			slog.String("user_id", caller.UserID.String()),
			slog.Any("error", err),
		)
		return err
	}

	s.log.InfoContext(ctx, "workspace deleted successfully",
		slog.String("workspace_id", id.String()),
		slog.String("user_id", caller.UserID.String()),
	)

	return nil
}
