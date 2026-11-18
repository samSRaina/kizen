package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/api/internal/adapter/repository/postgres/gen"
	"github.com/samSRaina/kizen/api/internal/domain/task"
)

type TaskRepository struct {
	q *gen.Queries
}

func NewTaskRepository(pool *pgxpool.Pool) *TaskRepository {
	return &TaskRepository{
		q: gen.New(pool),
	}
}

var _ task.Repository = (*TaskRepository)(nil)

func (r *TaskRepository) ListByProject(
	ctx context.Context,
	projectID uuid.UUID,
) ([]task.Task, error) {
	rows, err := r.q.ListTasksByProject(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("db list tasks by project: %w", err)
	}

	result := make([]task.Task, len(rows))
	for i, row := range rows {
		result[i] = mapGenTaskToDomain(row)
	}
	return result, nil
}

func (r *TaskRepository) GetByID(
	ctx context.Context,
	taskID uuid.UUID,
) (*task.Task, error) {
	row, err := r.q.GetTaskByID(ctx, taskID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, task.ErrNotFound
		}
		return nil, fmt.Errorf("db get task by id: %w", err)
	}

	t := mapGenTaskToDomain(row)
	return &t, nil
}

func (r *TaskRepository) GetByIdentifier(
	ctx context.Context,
	identifier string,
) (*task.Task, error) {
	row, err := r.q.GetTaskByIdentifier(ctx, identifier)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, task.ErrNotFound
		}
		return nil, fmt.Errorf("db get task by identifier: %w", err)
	}

	t := mapGenTaskToDomain(row)
	return &t, nil
}

func (r *TaskRepository) Create(
	ctx context.Context,
	projectID uuid.UUID,
	input task.CreateInput,
) (*task.Task, error) {
	status := string(task.StatusBacklog)
	if input.Status != nil {
		status = string(*input.Status)
	}

	row, err := r.q.CreateTask(ctx, gen.CreateTaskParams{
		ProjectID:   projectID,
		Title:       input.Title,
		Description: input.Description,
		Type:        string(input.Type),
		Status:      status,
		Priority:    string(input.Priority),
		Position:    nil,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, task.ErrNotFound
		}
		return nil, fmt.Errorf("db create task: %w", err)
	}

	t := mapGenTaskToDomain(row)
	return &t, nil
}

func (r *TaskRepository) Update(
	ctx context.Context,
	taskID uuid.UUID,
	input task.UpdateInput,
) (*task.Task, error) {
	var typeStr *string
	if input.Type != nil {
		s := string(*input.Type)
		typeStr = &s
	}

	var statusStr *string
	if input.Status != nil {
		s := string(*input.Status)
		statusStr = &s
	}

	var priorityStr *string
	if input.Priority != nil {
		s := string(*input.Priority)
		priorityStr = &s
	}

	row, err := r.q.UpdateTask(ctx, gen.UpdateTaskParams{
		ID:          taskID,
		Title:       input.Title,
		Description: input.Description,
		Type:        typeStr,
		Status:      statusStr,
		Priority:    priorityStr,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, task.ErrNotFound
		}
		return nil, fmt.Errorf("db update task: %w", err)
	}

	t := mapGenTaskToDomain(row)
	return &t, nil
}

func (r *TaskRepository) Reorder(
	ctx context.Context,
	taskID uuid.UUID,
	position float64,
) (*task.Task, error) {
	row, err := r.q.ReorderTask(ctx, gen.ReorderTaskParams{
		ID:       taskID,
		Position: position,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, task.ErrNotFound
		}
		return nil, fmt.Errorf("db reorder task: %w", err)
	}

	t := mapGenTaskToDomain(row)
	return &t, nil
}

func (r *TaskRepository) Delete(
	ctx context.Context,
	taskID uuid.UUID,
) error {
	rowsAffected, err := r.q.DeleteTask(ctx, taskID)
	if err != nil {
		return fmt.Errorf("db delete task: %w", err)
	}
	if rowsAffected == 0 {
		return task.ErrNotFound
	}
	return nil
}

func mapGenTaskToDomain(row gen.Task) task.Task {
	return task.Task{
		ID:          row.ID,
		ProjectID:   row.ProjectID,
		Identifier:  row.Identifier,
		Title:       row.Title,
		Description: row.Description,
		Type:        task.Type(row.Type),
		Status:      task.Status(row.Status),
		Priority:    task.Priority(row.Priority),
		Position:    row.Position,
		CreatedAt:   row.CreatedAt,
		UpdatedAt:   row.UpdatedAt,
	}
}
