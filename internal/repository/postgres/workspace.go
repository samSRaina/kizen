package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/samSRaina/kizen/internal/domain/auth"
	"github.com/samSRaina/kizen/internal/domain/workspace"
	"github.com/samSRaina/kizen/internal/repository/postgres/gen"
)

var ErrNotFound = errors.New("record not found")

type WorkspaceRepository interface {
	ListByUser(ctx context.Context, caller auth.Identity) ([]workspace.Workspace, error)
	Create(ctx context.Context, caller auth.Identity, input workspace.CreateWorkspaceInput) (*workspace.Workspace, error)
	Delete(ctx context.Context, caller auth.Identity, id uuid.UUID) error
}

type postgresWorkspaceRepository struct {
	queries *gen.Queries
}

func NewWorkspaceRepository(pool *pgxpool.Pool) WorkspaceRepository {
	return &postgresWorkspaceRepository{
		queries: gen.New(pool),
	}
}

func (r *postgresWorkspaceRepository) ListByUser(ctx context.Context, caller auth.Identity) ([]workspace.Workspace, error) {
	rows, err := r.queries.ListWorkspaces(ctx, caller.UserID)
	if err != nil {
		return nil, err
	}

	workspaces := make([]workspace.Workspace, len(rows))
	for i, row := range rows {
		workspaces[i] = workspace.Workspace{
			ID:                row.ID,
			OwnerID:           row.OwnerID,
			Name:              row.Name,
			DefaultHourlyRate: int(row.DefaultHourlyRate),
			Description:       row.Description,
			CreatedAt:         row.CreatedAt.Time,
			UpdatedAt:         row.UpdatedAt.Time,
		}
	}
	return workspaces, nil
}

func (r *postgresWorkspaceRepository) Create(ctx context.Context, caller auth.Identity, input workspace.CreateWorkspaceInput) (*workspace.Workspace, error) {
	row, err := r.queries.CreateWorkspace(ctx, gen.CreateWorkspaceParams{
		OwnerID:           caller.UserID,
		Name:              input.Name,
		DefaultHourlyRate: int32(input.DefaultHourlyRate),
		Description:       input.Description,
	})
	if err != nil {
		return nil, err
	}

	return &workspace.Workspace{
		ID:                row.ID,
		OwnerID:           row.OwnerID,
		Name:              row.Name,
		DefaultHourlyRate: int(row.DefaultHourlyRate),
		Description:       row.Description,
		CreatedAt:         row.CreatedAt.Time,
		UpdatedAt:         row.UpdatedAt.Time,
	}, nil
}

func (r *postgresWorkspaceRepository) Delete(ctx context.Context, caller auth.Identity, id uuid.UUID) error {
	rowsAffected, err := r.queries.DeleteWorkspace(ctx, gen.DeleteWorkspaceParams{
		ID:      id,
		OwnerID: caller.UserID,
	})
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}
