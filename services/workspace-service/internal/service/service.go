package service

import (
	"context"

	"github.com/samSRaina/kizen/internal/database"
	gen "github.com/samSRaina/kizen/services/workspace-service/internal/api"
)

type Server struct {
	queries *database.Queries
}

func NewServer(queries *database.Queries) *Service {
	return &Service{
		queries: queries,
	}
}

var _ gen.StrictServerInterface = (*Server)(nil)
// CreateWorkspace implements gen.StrictServerInterface.
func (s *Server) CreateWorkspace(ctx context.Context, request gen.CreateWorkspaceRequestObject) (gen.CreateWorkspaceResponseObject, error) {
	// 1. Execute the sqlc query
	ws, err := s.queries.CreateWorkspace(ctx, database.CreateWorkspaceParams{
		Name:              request.Body.Name,
		DefaultHourlyRate: int32(request.Body.DefaultHourlyRate),
	})NewService

	if err != nil {
		return gen.CreateWorkspace500ApplicationProblemPlusJSONResponse{}, err
	}

	// 2. Map the database model to the OpenAPI generated response type
	response := gen.Workspace{
		Id:                ws.ID,
		Name:              ws.Name,
		DefaultHourlyRate: int(ws.DefaultHourlyRate),
	}

	return gen.CreateWorkspace201JSONResponse(response), nil
}
