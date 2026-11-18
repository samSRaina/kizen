package task

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	// ListByProject returns all tasks belonging to a project, ordered by position.
	ListByProject(ctx context.Context, projectID uuid.UUID) ([]Task, error)

	// GetByID returns a single task by its UUID.
	GetByID(ctx context.Context, taskID uuid.UUID) (*Task, error)

	// GetByIdentifier returns a single task by its human-readable identifier (e.g. "KIZ-42").
	GetByIdentifier(ctx context.Context, identifier string) (*Task, error)

	// Create inserts a new task into a project.
	Create(ctx context.Context, projectID uuid.UUID, input CreateInput) (*Task, error)

	// Update applies a partial patch to task fields (title, description, type, status, priority).
	Update(ctx context.Context, taskID uuid.UUID, input UpdateInput) (*Task, error)

	// Reorder sets a new floating-point position for a task within its project column.
	// Intentionally separate from Update — drag-and-drop reorders touch only the
	// position column and carry no business-rule validation.
	Reorder(ctx context.Context, taskID uuid.UUID, position float64) (*Task, error)

	// Delete permanently removes a task.
	Delete(ctx context.Context, taskID uuid.UUID) error
}
