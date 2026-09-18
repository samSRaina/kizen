package repository

import (
	"context"
	"fmt"

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
