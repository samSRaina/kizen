// Package service implements the generated OpenAPI strict-server interface
// directly over sqlc queries — no repository or service indirection.
package service

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/samSRaina/kizen/internal/database"
	"github.com/samSRaina/kizen/services/workspace-service/internal/api"
)

type Service struct {
	queries *database.Queries
}

func NewService(queries *database.Queries) *Service {
	return &Service{queries: queries}
}

var _ api.StrictServerInterface = (*Service)(nil)

func (s *Service) CreateWorkspace(ctx context.Context, request api.CreateWorkspaceRequestObject) (api.CreateWorkspaceResponseObject, error) {
	ws, err := s.queries.CreateWorkspace(ctx, database.CreateWorkspaceParams{
		Name:              request.Body.Name,
		DefaultHourlyRate: int32(request.Body.DefaultHourlyRate),
	})
	if err != nil {
		return nil, fmt.Errorf("create workspace: %w", err)
	}

	return api.CreateWorkspace201JSONResponse(toAPI(ws)), nil
}

func (s *Service) ListWorkspaces(ctx context.Context, _ api.ListWorkspacesRequestObject) (api.ListWorkspacesResponseObject, error) {
	rows, err := s.queries.ListWorkspaces(ctx)
	if err != nil {
		return nil, fmt.Errorf("list workspaces: %w", err)
	}

	workspaces := make([]api.Workspace, 0, len(rows))
	for _, ws := range rows {
		workspaces = append(workspaces, toAPI(ws))
	}

	return api.ListWorkspaces200JSONResponse(workspaces), nil
}

func (s *Service) GetWorkspace(ctx context.Context, request api.GetWorkspaceRequestObject) (api.GetWorkspaceResponseObject, error) {
	ws, err := s.queries.GetWorkspaceByID(ctx, pgtype.UUID{Bytes: request.Id, Valid: true})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return api.GetWorkspace404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: api.NotFoundApplicationProblemPlusJSONResponse{
					Status: http.StatusNotFound,
					Title:  "workspace not found",
				},
			}, nil
		}
		return nil, fmt.Errorf("get workspace: %w", err)
	}

	return api.GetWorkspace200JSONResponse(toAPI(ws)), nil
}

// toAPI maps a sqlc row to the generated response model.
func toAPI(ws database.Workspace) api.Workspace {
	return api.Workspace{
		Id:                uuid.UUID(ws.ID.Bytes),
		Name:              ws.Name,
		DefaultHourlyRate: int(ws.DefaultHourlyRate),
	}
}
