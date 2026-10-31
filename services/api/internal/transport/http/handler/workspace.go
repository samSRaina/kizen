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

type WorkspaceHandler struct {
	workspaceService *workspace.Service
}

func NewWorkspaceHandler(wsService *workspace.Service) *WorkspaceHandler {
	return &WorkspaceHandler{
		workspaceService: wsService,
	}
}

// ListWorkspaces handles GET /workspaces
func (h *WorkspaceHandler) ListWorkspaces(
	ctx context.Context,
	request gen.ListWorkspacesRequestObject,
) (gen.ListWorkspacesResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.ListWorkspaces401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	workspaces, err := h.workspaceService.List(ctx, *caller)
	if err != nil {
		return gen.ListWorkspaces500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to retrieve workspaces"),
			},
		}, nil
	}

	items := make([]gen.Workspace, len(workspaces))
	for i, ws := range workspaces {
		items[i] = gen.Workspace{
			Id:                ws.ID,
			OwnerId:           ws.OwnerID.String(),
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
func (h *WorkspaceHandler) CreateWorkspace(
	ctx context.Context,
	request gen.CreateWorkspaceRequestObject,
) (gen.CreateWorkspaceResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.CreateWorkspace401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
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
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		if errors.Is(err, domainWorkspace.ErrDuplicateName) {
			return gen.CreateWorkspace409ApplicationProblemPlusJSONResponse{
				ConflictApplicationProblemPlusJSONResponse: gen.ConflictApplicationProblemPlusJSONResponse{
					Status: 409,
					Title:  "Conflict",
					Detail: new("A workspace with this name already exists"),
				},
			}, nil
		}
		return gen.CreateWorkspace500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to create workspace"),
			},
		}, nil
	}

	return gen.CreateWorkspace201JSONResponse{
		Id:                ws.ID,
		OwnerId:           ws.OwnerID.String(),
		Name:              ws.Name,
		DefaultHourlyRate: ws.DefaultHourlyRate,
		Description:       ws.Description,
		CreatedAt:         ws.CreatedAt,
		UpdatedAt:         ws.UpdatedAt,
	}, nil
}

// GetWorkspace handles GET /workspaces/{id}
func (h *WorkspaceHandler) GetWorkspace(
	ctx context.Context,
	request gen.GetWorkspaceRequestObject,
) (gen.GetWorkspaceResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.GetWorkspace401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	wsID := uuid.UUID(request.Id)
	ws, err := h.workspaceService.GetByID(ctx, *caller, wsID)
	if err != nil {
		if errors.Is(err, domainWorkspace.ErrNotFound) || errors.Is(err, domainWorkspace.ErrInvalidInput) {
			return gen.GetWorkspace404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Workspace not found"),
				},
			}, nil
		}
		return gen.GetWorkspace500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to retrieve workspace"),
			},
		}, nil
	}

	return gen.GetWorkspace200JSONResponse{
		Id:                ws.ID,
		OwnerId:           ws.OwnerID.String(),
		Name:              ws.Name,
		DefaultHourlyRate: ws.DefaultHourlyRate,
		Description:       ws.Description,
		CreatedAt:         ws.CreatedAt,
		UpdatedAt:         ws.UpdatedAt,
	}, nil
}

// UpdateWorkspace handles PATCH /workspaces/{id}
func (h *WorkspaceHandler) UpdateWorkspace(
	ctx context.Context,
	request gen.UpdateWorkspaceRequestObject,
) (gen.UpdateWorkspaceResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.UpdateWorkspace401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	if request.Body == nil {
		return gen.UpdateWorkspace400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
				Status: 400,
				Title:  "Bad Request",
				Detail: new("Request body cannot be empty"),
			},
		}, nil
	}

	wsID := uuid.UUID(request.Id)
	input := domainWorkspace.UpdateInput{
		Name:              request.Body.Name,
		DefaultHourlyRate: request.Body.DefaultHourlyRate,
		Description:       request.Body.Description,
	}

	ws, err := h.workspaceService.Update(ctx, *caller, wsID, input)
	if err != nil {
		if errors.Is(err, domainWorkspace.ErrInvalidInput) {
			return gen.UpdateWorkspace400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		if errors.Is(err, domainWorkspace.ErrNotFound) {
			return gen.UpdateWorkspace404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Workspace not found"),
				},
			}, nil
		}
		if errors.Is(err, domainWorkspace.ErrDuplicateName) {
			return gen.UpdateWorkspace409ApplicationProblemPlusJSONResponse{
				ConflictApplicationProblemPlusJSONResponse: gen.ConflictApplicationProblemPlusJSONResponse{
					Status: 409,
					Title:  "Conflict",
					Detail: new("A workspace with this name already exists"),
				},
			}, nil
		}
		return gen.UpdateWorkspace500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to update workspace"),
			},
		}, nil
	}

	return gen.UpdateWorkspace200JSONResponse{
		Id:                ws.ID,
		OwnerId:           ws.OwnerID.String(),
		Name:              ws.Name,
		DefaultHourlyRate: ws.DefaultHourlyRate,
		Description:       ws.Description,
		CreatedAt:         ws.CreatedAt,
		UpdatedAt:         ws.UpdatedAt,
	}, nil
}

// DeleteWorkspace handles DELETE /workspaces/{id}
func (h *WorkspaceHandler) DeleteWorkspace(
	ctx context.Context,
	request gen.DeleteWorkspaceRequestObject,
) (gen.DeleteWorkspaceResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.DeleteWorkspace401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	wsID := uuid.UUID(request.Id)
	if err := h.workspaceService.Delete(ctx, *caller, wsID); err != nil {
		if errors.Is(err, domainWorkspace.ErrNotFound) {
			return gen.DeleteWorkspace404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Workspace not found"),
				},
			}, nil
		}
		return gen.DeleteWorkspace500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to delete workspace"),
			},
		}, nil
	}

	return gen.DeleteWorkspace204Response{}, nil
}
