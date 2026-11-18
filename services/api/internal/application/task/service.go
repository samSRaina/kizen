package task

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/task"
)

// Service coordinates business use cases for task management.
type Service struct {
	repo task.Repository
	log  *slog.Logger
}

// NewService constructs a Task Service.
func NewService(repo task.Repository, log *slog.Logger) *Service {
	return &Service{
		repo: repo,
		log:  log,
	}
}

// ListByProject returns all tasks for a project ordered by position.
func (s *Service) ListByProject(ctx context.Context, projectID uuid.UUID) ([]task.Task, error) {
	if _, err := auth.MustUserIDFrom(ctx); err != nil {
		return nil, err
	}
	if projectID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid project uuid", task.ErrInvalidInput)
	}

	tasks, err := s.repo.ListByProject(ctx, projectID)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to list tasks",
			slog.String("project_id", projectID.String()),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("listing tasks: %w", err)
	}

	return tasks, nil
}

// GetByID returns a task by its UUID.
func (s *Service) GetByID(ctx context.Context, taskID uuid.UUID) (*task.Task, error) {
	if _, err := auth.MustUserIDFrom(ctx); err != nil {
		return nil, err
	}
	if taskID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid task uuid", task.ErrInvalidInput)
	}

	t, err := s.repo.GetByID(ctx, taskID)
	if err != nil {
		return nil, err
	}

	return t, nil
}

// GetByIdentifier returns a task by its identifier (e.g. "PRJ-1").
func (s *Service) GetByIdentifier(ctx context.Context, identifier string) (*task.Task, error) {
	if _, err := auth.MustUserIDFrom(ctx); err != nil {
		return nil, err
	}
	if identifier == "" {
		return nil, fmt.Errorf("%w: invalid task identifier", task.ErrInvalidInput)
	}

	t, err := s.repo.GetByIdentifier(ctx, identifier)
	if err != nil {
		return nil, err
	}

	return t, nil
}

// Create validates business invariants and creates a new task within a project.
func (s *Service) Create(ctx context.Context, projectID uuid.UUID, input task.CreateInput) (*task.Task, error) {
	if _, err := auth.MustUserIDFrom(ctx); err != nil {
		return nil, err
	}
	if projectID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid project uuid", task.ErrInvalidInput)
	}

	if err := input.Validate(); err != nil {
		return nil, err
	}

	t, err := s.repo.Create(ctx, projectID, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to create task",
			slog.String("project_id", projectID.String()),
			slog.String("title", input.Title),
			slog.Any("error", err),
		)
		return nil, fmt.Errorf("creating task: %w", err)
	}

	s.log.InfoContext(ctx, "task created successfully",
		slog.String("task_id", t.ID.String()),
		slog.String("identifier", t.Identifier),
		slog.String("project_id", projectID.String()),
	)

	return t, nil
}

// Update validates business invariants and patches an existing task.
func (s *Service) Update(ctx context.Context, taskID uuid.UUID, input task.UpdateInput) (*task.Task, error) {
	if _, err := auth.MustUserIDFrom(ctx); err != nil {
		return nil, err
	}
	if taskID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid task uuid", task.ErrInvalidInput)
	}

	if err := input.Validate(); err != nil {
		return nil, err
	}

	// If transitioning status, validate against domain state machine
	if input.Status != nil {
		current, err := s.repo.GetByID(ctx, taskID)
		if err != nil {
			return nil, err
		}
		if err := current.TransitionStatus(*input.Status); err != nil {
			return nil, err
		}
	}

	t, err := s.repo.Update(ctx, taskID, input)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to update task",
			slog.String("task_id", taskID.String()),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "task updated successfully",
		slog.String("task_id", t.ID.String()),
		slog.String("identifier", t.Identifier),
	)

	return t, nil
}

// Reorder changes a task's fractional board position.
func (s *Service) Reorder(ctx context.Context, taskID uuid.UUID, position float64) (*task.Task, error) {
	if _, err := auth.MustUserIDFrom(ctx); err != nil {
		return nil, err
	}
	if taskID == uuid.Nil {
		return nil, fmt.Errorf("%w: invalid task uuid", task.ErrInvalidInput)
	}

	t, err := s.repo.Reorder(ctx, taskID, position)
	if err != nil {
		s.log.ErrorContext(ctx, "failed to reorder task",
			slog.String("task_id", taskID.String()),
			slog.Float64("position", position),
			slog.Any("error", err),
		)
		return nil, err
	}

	s.log.InfoContext(ctx, "task reordered successfully",
		slog.String("task_id", t.ID.String()),
		slog.Float64("position", position),
	)

	return t, nil
}

// Delete permanently removes a task.
func (s *Service) Delete(ctx context.Context, taskID uuid.UUID) error {
	if _, err := auth.MustUserIDFrom(ctx); err != nil {
		return err
	}
	if taskID == uuid.Nil {
		return fmt.Errorf("%w: invalid task uuid", task.ErrInvalidInput)
	}

	if err := s.repo.Delete(ctx, taskID); err != nil {
		s.log.ErrorContext(ctx, "failed to delete task",
			slog.String("task_id", taskID.String()),
			slog.Any("error", err),
		)
		return err
	}

	s.log.InfoContext(ctx, "task deleted successfully",
		slog.String("task_id", taskID.String()),
	)

	return nil
}
