package handler

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/application/workspace"
	domainWorkspace "github.com/samSRaina/kizen/api/internal/domain/workspace"
	"github.com/samSRaina/kizen/api/internal/transport/http/gen"
	"github.com/samSRaina/kizen/api/internal/transport/http/middleware"
)

var _ gen.StrictServerInterface = (*Handler)(nil)

type Handler struct {
	workspaceService *workspace.Service
}

func NewHandler(wsService *workspace.Service) *Handler {
	return &Handler{
		workspaceService: wsService,
	}
}

// ListWorkspaces handles GET /workspaces
func (h *Handler) ListWorkspaces(
	ctx context.Context,
	request gen.ListWorkspacesRequestObject,
) (gen.ListWorkspacesResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.ListWorkspaces401ApplicationProblemPlusJSONResponse{
			Status: 401,
			Title:  "Unauthorized",
			Detail: new("Authentication credentials are required"),
		}, nil
	}

	workspaces, err := h.workspaceService.List(ctx, *caller)
	if err != nil {
		return gen.ListWorkspaces500ApplicationProblemPlusJSONResponse{
			Status: 500,
			Title:  "Internal Server Error",
			Detail: new("Failed to retrieve workspaces"),
		}, nil
	}

	items := make([]gen.Workspace, len(workspaces))
	for i, ws := range workspaces {
		items[i] = gen.Workspace{
			Id:                ws.ID,
			Name:              ws.Name,
			DefaultHourlyRate: ws.DefaultHourlyRate,
			Description:       ws.Description,
			CreatedAt:         ws.CreatedAt,
			UpdatedAt:         ws.UpdatedAt,
		}
	}

	return gen.ListWorkspaces200JSONResponse(items), nil
}

// CreateWorkspace handles POST /workspaces
func (h *Handler) CreateWorkspace(
	ctx context.Context,
	request gen.CreateWorkspaceRequestObject,
) (gen.CreateWorkspaceResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.CreateWorkspace401ApplicationProblemPlusJSONResponse{
			Status: 401,
			Title:  "Unauthorized",
			Detail: new("Authentication credentials are required"),
		}, nil
	}

	ws, err := h.workspaceService.Create(ctx, *caller, domainWorkspace.CreateInput{
		Name:              request.Body.Name,
		DefaultHourlyRate: request.Body.DefaultHourlyRate,
		Description:       request.Body.Description,
	})
	if err != nil {
		if errors.Is(err, domainWorkspace.ErrInvalidInput) {
			return gen.CreateWorkspace400ApplicationProblemPlusJSONResponse{
				Status: 400,
				Title:  "Bad Request",
				Detail: new(err.Error()),
			}, nil
		}
		if errors.Is(err, domainWorkspace.ErrDuplicateName) {
			return gen.CreateWorkspace409ApplicationProblemPlusJSONResponse{
				Status: 409,
				Title:  "Conflict",
				Detail: new("A workspace with this name already exists"),
			}, nil
		}
		return gen.CreateWorkspace500ApplicationProblemPlusJSONResponse{
			Status: 500,
			Title:  "Internal Server Error",
			Detail: new("Failed to create workspace"),
		}, nil
	}

	return gen.CreateWorkspace201JSONResponse{
		Id:                ws.ID,
		Name:              ws.Name,
		DefaultHourlyRate: ws.DefaultHourlyRate,
		Description:       ws.Description,
		CreatedAt:         ws.CreatedAt,
		UpdatedAt:         ws.UpdatedAt,
	}, nil
}

// DeleteWorkspace handles DELETE /workspaces/{id}
func (h *Handler) DeleteWorkspace(
	ctx context.Context,
	request gen.DeleteWorkspaceRequestObject,
) (gen.DeleteWorkspaceResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.DeleteWorkspace401ApplicationProblemPlusJSONResponse{
			Status: 401,
			Title:  "Unauthorized",
			Detail: new("Authentication credentials are required"),
		}, nil
	}

	wsID := uuid.UUID(request.Id)
	if err := h.workspaceService.Delete(ctx, *caller, wsID); err != nil {
		if errors.Is(err, domainWorkspace.ErrNotFound) {
			return gen.DeleteWorkspace404ApplicationProblemPlusJSONResponse{
				Status: 404,
				Title:  "Not Found",
				Detail: new("Workspace not found"),
			}, nil
		}
		return gen.DeleteWorkspace500ApplicationProblemPlusJSONResponse{
			Status: 500,
			Title:  "Internal Server Error",
			Detail: new("Failed to delete workspace"),
		}, nil
	}

	return gen.DeleteWorkspace204Response{}, nil
}
