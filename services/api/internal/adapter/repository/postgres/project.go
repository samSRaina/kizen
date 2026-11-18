package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/api/internal/adapter/repository/postgres/gen"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/project"
)

type ProjectRepository struct {
	q *gen.Queries
}

func NewProjectRepository(pool *pgxpool.Pool) *ProjectRepository {
	return &ProjectRepository{
		q: gen.New(pool),
	}
}

var _ project.Repository = (*ProjectRepository)(nil)

func (r *ProjectRepository) Create(ctx context.Context, input project.CreateInput) (*project.Project, error) {
	ownerID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}

	settingsJSON, err := json.Marshal(input.Settings)
	if err != nil {
		return nil, fmt.Errorf("marshal settings: %w", err)
	}

	row, err := r.q.CreateProject(ctx, gen.CreateProjectParams{
		WorkspaceID:       input.WorkspaceID,
		Name:              input.Name,
		TicketIDPrefix:    input.TicketIDPrefix,
		Settings:          settingsJSON,
		DefaultHourlyRate: int32(input.DefaultHourlyRate),
		Description:       input.Description,
		OwnerID:           ownerID.String(),
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, project.ErrDuplicateName
		}
		return nil, fmt.Errorf("db create project: %w", err)
	}

	return mapGenProjectToDomain(row), nil
}

func (r *ProjectRepository) ListByWorkspace(ctx context.Context, workspaceID uuid.UUID) ([]project.Project, error) {
	ownerID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}

	rows, err := r.q.ListProjectsByWorkspace(ctx, gen.ListProjectsByWorkspaceParams{
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		return nil, fmt.Errorf("db list projects: %w", err)
	}

	result := make([]project.Project, len(rows))
	for i, row := range rows {
		result[i] = *mapGenProjectToDomain(row)
	}
	return result, nil
}

func (r *ProjectRepository) GetByID(ctx context.Context, workspaceID, projectID uuid.UUID) (*project.Project, error) {
	ownerID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}

	row, err := r.q.GetProjectByID(ctx, gen.GetProjectByIDParams{
		ID:          projectID,
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, project.ErrNotFound
		}
		return nil, fmt.Errorf("db get project: %w", err)
	}

	return mapGenProjectToDomain(row), nil
}

func (r *ProjectRepository) Update(
	ctx context.Context,
	workspaceID, projectID uuid.UUID,
	input project.UpdateInput,
) (*project.Project, error) {
	ownerID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return nil, err
	}

	var settingsJSON []byte
	if input.Settings != nil {
		var err error
		settingsJSON, err = json.Marshal(input.Settings)
		if err != nil {
			return nil, fmt.Errorf("marshal settings: %w", err)
		}
	}

	var hourlyRate *int32
	if input.DefaultHourlyRate != nil {
		rate := int32(*input.DefaultHourlyRate)
		hourlyRate = &rate
	}

	row, err := r.q.UpdateProject(ctx, gen.UpdateProjectParams{
		Name:              input.Name,
		TicketIDPrefix:    input.TicketIDPrefix,
		Settings:          settingsJSON,
		DefaultHourlyRate: hourlyRate,
		Description:       input.Description,
		ID:                projectID,
		WorkspaceID:       workspaceID,
		OwnerID:           ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, project.ErrNotFound
		}
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, project.ErrDuplicateName
		}
		return nil, fmt.Errorf("db update project: %w", err)
	}

	return mapGenProjectToDomain(row), nil
}

func (r *ProjectRepository) Delete(ctx context.Context, workspaceID, projectID uuid.UUID) error {
	ownerID, err := auth.MustUserIDFrom(ctx)
	if err != nil {
		return err
	}

	rowsAffected, err := r.q.DeleteProject(ctx, gen.DeleteProjectParams{
		ID:          projectID,
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		return fmt.Errorf("db delete project: %w", err)
	}
	if rowsAffected == 0 {
		return project.ErrNotFound
	}
	return nil
}

func mapGenProjectToDomain(row gen.Project) *project.Project {
	var settings map[string]any
	if len(row.Settings) > 0 {
		_ = json.Unmarshal(row.Settings, &settings)
	}
	if settings == nil {
		settings = make(map[string]any)
	}

	var deletedAt *time.Time
	if row.DeletedAt.Valid {
		deletedAt = &row.DeletedAt.Time
	}

	return &project.Project{
		ID:                row.ID,
		WorkspaceID:       row.WorkspaceID,
		Name:              row.Name,
		TicketIDPrefix:    row.TicketIDPrefix,
		Settings:          settings,
		DefaultHourlyRate: int(row.DefaultHourlyRate),
		Description:       row.Description,
		CreatedAt:         row.CreatedAt,
		UpdatedAt:         row.UpdatedAt,
		DeletedAt:         deletedAt,
	}
}
