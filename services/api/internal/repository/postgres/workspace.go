package postgres

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/api/internal/application/ports"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/workspace"
	"github.com/samSRaina/kizen/api/internal/repository/postgres/gen"
)

type Repository struct {
	q *gen.Queries
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{
		q: gen.New(pool),
	}
}

var _ ports.WorkspaceRepository = (*Repository)(nil)

func (r *Repository) Create(ctx context.Context, ownerID auth.UserID, input workspace.CreateInput) (*workspace.Workspace, error) {
	row, err := r.q.CreateWorkspace(ctx, gen.CreateWorkspaceParams{
		OwnerID:           ownerID.String(),
		Name:              input.Name,
		DefaultHourlyRate: int32(input.DefaultHourlyRate),
		Description:       input.Description,
	})

	if err != nil {
		// var pgErr *pgconn.PgError
		// if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		// 	return nil, workspace.ErrDuplicateName
		// }
		return nil, fmt.Errorf("db create workspace: %w", err)
	}
	return &workspace.Workspace{
		ID:                row.ID,
		OwnerID:           auth.UserID(row.OwnerID),
		Name:              row.Name,
		DefaultHourlyRate: int(row.DefaultHourlyRate),
		Description:       row.Description,
		CreatedAt:         row.CreatedAt,
		UpdatedAt:         row.UpdatedAt,
	}, nil
}

func (r *Repository) ListByUser(ctx context.Context, ownerID auth.UserID) ([]workspace.Workspace, error) {
	rows, err := r.q.ListWorkspaces(ctx, ownerID.String())
	if err != nil {
		return nil, fmt.Errorf("db list workspaces: %w", err)
	}

	result := make([]workspace.Workspace, len(rows))
	for i, row := range rows {
		result[i] = workspace.Workspace{
			ID:                uuid.UUID(row.ID),
			OwnerID:           auth.UserID(row.OwnerID),
			Name:              row.Name,
			DefaultHourlyRate: int(row.DefaultHourlyRate),
			Description:       row.Description,
			CreatedAt:         row.CreatedAt,
			UpdatedAt:         row.UpdatedAt,
		}
	}

	return result, nil
}

func (r *Repository) GetByID(ctx context.Context, ownerID auth.UserID, id uuid.UUID) (*workspace.Workspace, error) {
	row, err := r.q.GetWorkspaceByID(ctx, gen.GetWorkspaceByIDParams{
		ID:      id,
		OwnerID: ownerID.String(),
	})
	if err != nil {
		// if errors.Is(err, pgx.ErrNoRows) {
		// 	return nil, workspace.ErrNotFound
		// }
		return nil, fmt.Errorf("db get workspace: %w", err)
	}

	return &workspace.Workspace{
		ID:                uuid.UUID(row.ID),
		OwnerID:           auth.UserID(row.OwnerID),
		Name:              row.Name,
		DefaultHourlyRate: int(row.DefaultHourlyRate),
		Description:       row.Description,
		CreatedAt:         row.CreatedAt,
		UpdatedAt:         row.UpdatedAt,
	}, nil
}

func (r *Repository) Delete(ctx context.Context, ownerID auth.UserID, id uuid.UUID) error {
	rowsAffected, err := r.q.DeleteWorkspace(ctx, gen.DeleteWorkspaceParams{
		ID:      id,
		OwnerID: ownerID.String(),
	})
	if err != nil {
		return fmt.Errorf("db delete workspace: %w", err)
	}

	if rowsAffected == 0 {
		return workspace.ErrNotFound
	}
	return nil
}
