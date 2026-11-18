package workspace

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/ws"
)

// Service coordinates business use cases for workspace management.
type Service struct {
	repo ws.Repository
	log  *slog.Logger
}

// NewService constructs a WorkspaceService. It accepts the port interface and returns a concrete pointer.
func NewService(repo ws.Repository, log *slog.Logger) *Service {
	return &Service{
		repo: repo,
		log:  log,
	}
}

// List retrieves all workspaces owned by the authenticated caller.
func (s *Service) List(ctx context.Context) ([]ws.Workspace, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}

	workspaces, err := s.repo.ListByUser(ctx)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to list workspaces",
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("listing workspaces: %w", err)
	}

	return workspaces, nil
}

// GetByID retrieves a single workspace if owned by the caller.
func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*ws.Workspace, error) {
	if _, err := auth.MustUserIDFrom(ctx); err != nil {
		return nil, err
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", ws.ErrInvalidInput)
	}

	workspace, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return workspace, nil
}

// Create validates business invariants and persists a new workspace.
func (s *Service) Create(ctx context.Context, input ws.CreateInput) (*ws.Workspace, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}

	// Pure domain validation
	if err := input.Validate(); err != nil {
		return nil, err
	}

	workspace, err := s.repo.Create(ctx, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to create workspace",
			slog.String("user_id", userID.String()),
			slog.String("name", input.Name),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("creating workspace: %w", err)
	}

	s.log.InfoContext(ctx, "workspace created successfully",
		slog.String("workspace_id", workspace.ID.String()),
		slog.String("user_id", userID.String()),
	)

	return workspace, nil
}

// Update validates business invariants and updates a workspace owned by the caller.
func (s *Service) Update(
	ctx context.Context,
	id uuid.UUID,
	input ws.UpdateInput,
) (*ws.Workspace, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if id == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", ws.ErrInvalidInput)
	}

	if err := input.Validate(); err != nil {
		return nil, err
	}

	workspace, err := s.repo.Update(ctx, id, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to update workspace",
			slog.String("workspace_id", id.String()),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "workspace updated successfully",
		slog.String("workspace_id", workspace.ID.String()),
		slog.String("user_id", userID.String()),
	)

	return workspace, nil
}

// Delete removes a workspace owned by the caller.
func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return err
	}
	if id == uuid.Nil {
		return fmt.Errorf("%w: invalid workspace uuid", ws.ErrInvalidInput)
	}

	if err := s.repo.Delete(ctx, id); err != nil {
		s.log.ErrorContext(ctx, "failed to delete workspace",
			slog.String("workspace_id", id.String()),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return err
	}

	s.log.InfoContext(ctx, "workspace deleted successfully",
		slog.String("workspace_id", id.String()),
		slog.String("user_id", userID.String()),
	)

	return nil
}
