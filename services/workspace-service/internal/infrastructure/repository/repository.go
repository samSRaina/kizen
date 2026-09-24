package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/internal/database"
	"github.com/samSRaina/kizen/services/workspace-service/internal/domain"
)

type Repository struct {
	q *database.Queries
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{
		q: database.New(pool),
	}
}

func (r *Repository) Create(ctx context.Context, in domain.CreateWorkspaceInput) (*domain.Workspace, error) {
	row, err := r.q.CreateWorkspace(ctx, database.CreateWorkspaceParams{
		Name:              in.Name,
		DefaultHourlyRate: int32(in.DefaultHourlyRate),
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, fmt.Errorf("%w: workspace name already exists", domain.ErrConflict)
		}
		return nil, fmt.Errorf("create workspace: %w", err)
	}
	return &domain.Workspace{
		ID:                row.ID,
		Name:              row.Name,
		Description:       row.Description,
		DefaultHourlyRate: int(row.DefaultHourlyRate),
		CreatedAt:         row.CreatedAt.Time,
		UpdatedAt:         row.UpdatedAt.Time,
	}, nil
}

func (r *Repository) Delete(ctx context.Context, id uuid.UUID) error {
	rows, err := r.q.DeleteWorkspace(ctx, id)
	if err != nil {
		return fmt.Errorf("delete workspace: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("delete workspace: %w", domain.ErrNotFound)
	}
	return nil
}
