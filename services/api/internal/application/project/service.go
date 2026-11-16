package project

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/project"
)

// Service coordinates business use cases for project management.
type Service struct {
	repo project.Repository
	log  *slog.Logger
}

// NewService constructs a Project Service.
func NewService(repo project.Repository, log *slog.Logger) *Service {
	return &Service{
		repo: repo,
		log:  log,
	}
}

// List retrieves all projects within a workspace owned by the caller.
func (s *Service) List(ctx context.Context, workspaceID uuid.UUID) ([]project.Project, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace uuid", project.ErrInvalidInput)
	}

	projects, err := s.repo.ListByWorkspace(ctx, userID, workspaceID)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to list projects",
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("listing projects: %w", err)
	}

	return projects, nil
}

// GetByID retrieves a single project by id within a workspace.
func (s *Service) GetByID(ctx context.Context, workspaceID, projectID uuid.UUID) (*project.Project, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil || projectID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace or project uuid", project.ErrInvalidInput)
	}

	prj, err := s.repo.GetByID(ctx, userID, workspaceID, projectID)
	if err != nil {
		return nil, err
	}

	return prj, nil
}

// Create validates business invariants and creates a new project.
func (s *Service) Create(ctx context.Context, input project.CreateInput) (*project.Project, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}

	if err := input.Validate(); err != nil {
		return nil, err
	}

	prj, err := s.repo.Create(ctx, userID, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to create project",
			slog.String("workspace_id", input.WorkspaceID.String()),
			slog.String("user_id", userID.String()),
			slog.String("name", input.Name),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("creating project: %w", err)
	}

	s.log.InfoContext(ctx, "project created successfully",
		slog.String("project_id", prj.ID.String()),
		slog.String("workspace_id", prj.WorkspaceID.String()),
		slog.String("user_id", userID.String()),
	)

	return prj, nil
}

// Update validates business invariants and updates an existing project.
func (s *Service) Update(
	ctx context.Context,
	workspaceID, projectID uuid.UUID,
	input project.UpdateInput,
) (*project.Project, error) {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}
	if workspaceID == uuid.Nil || projectID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid workspace or project uuid", project.ErrInvalidInput)
	}

	if err := input.Validate(); err != nil {
		return nil, err
	}

	prj, err := s.repo.Update(ctx, userID, workspaceID, projectID, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to update project",
			slog.String("project_id", projectID.String()),
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "project updated successfully",
		slog.String("project_id", prj.ID.String()),
		slog.String("user_id", userID.String()),
	)

	return prj, nil
}

// Delete marks a project as deleted (soft delete).
func (s *Service) Delete(ctx context.Context, workspaceID, projectID uuid.UUID) error {
	userID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return err
	}
	if workspaceID == uuid.Nil || projectID == uuid.Nil {
		return fmt.Errorf("%w: invalid workspace or project uuid", project.ErrInvalidInput)
	}

	if err := s.repo.Delete(ctx, userID, workspaceID, projectID); err != nil {
		s.log.ErrorContext(ctx, "failed to delete project",
			slog.String("project_id", projectID.String()),
			slog.String("workspace_id", workspaceID.String()),
			slog.String("user_id", userID.String()),
			slog.Any("error", err),
		)
		return err
	}

	s.log.InfoContext(ctx, "project deleted successfully",
		slog.String("project_id", projectID.String()),
		slog.String("workspace_id", workspaceID.String()),
		slog.String("user_id", userID.String()),
	)

	return nil
}
