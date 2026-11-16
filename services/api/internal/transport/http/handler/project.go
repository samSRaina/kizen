package handler

import (
	"context"
	"errors"

	"github.com/google/uuid"
	appProject "github.com/samSRaina/kizen/api/internal/application/project"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	domainProject "github.com/samSRaina/kizen/api/internal/domain/project"
	"github.com/samSRaina/kizen/api/internal/transport/http/gen"
)

type ProjectHandler struct {
	projectService *appProject.Service
}

func NewProjectHandler(projectService *appProject.Service) *ProjectHandler {
	return &ProjectHandler{
		projectService: projectService,
	}
}

// ListProjects handles GET /ws/{workspace_id}/p
func (h *ProjectHandler) ListProjects(
	ctx context.Context,
	req gen.ListProjectsRequestObject,
) (gen.ListProjectsResponseObject, error) {
	wsID := uuid.UUID(req.WorkspaceId)
	projects, err := h.projectService.List(ctx, wsID)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.ListProjects401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainProject.ErrInvalidInput) {
			return gen.ListProjects404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Workspace not found"),
				},
			}, nil
		}
		return gen.ListProjects500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to retrieve projects"),
			},
		}, nil
	}

	items := make([]gen.Project, len(projects))
	for i, p := range projects {
		items[i] = mapDomainProjectToGen(p)
	}

	return gen.ListProjects200JSONResponse(items), nil
}

// CreateProject handles POST /ws/{workspace_id}/p
func (h *ProjectHandler) CreateProject(
	ctx context.Context,
	req gen.CreateProjectRequestObject,
) (gen.CreateProjectResponseObject, error) {
	wsID := uuid.UUID(req.WorkspaceId)

	hourlyRate := 0
	if req.Body.DefaultHourlyRate != nil {
		hourlyRate = *req.Body.DefaultHourlyRate
	}

	prefix := ""
	if req.Body.TicketIdPrefix != nil {
		prefix = *req.Body.TicketIdPrefix
	}

	var settings map[string]any
	if req.Body.Settings != nil {
		settings = *req.Body.Settings
	}

	prj, err := h.projectService.Create(ctx, domainProject.CreateInput{
		WorkspaceID:       wsID,
		Name:              req.Body.Name,
		TicketIDPrefix:    prefix,
		Settings:          settings,
		DefaultHourlyRate: hourlyRate,
		Description:       req.Body.Description,
	})
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.CreateProject401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainProject.ErrInvalidInput) {
			return gen.CreateProject400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		if errors.Is(err, domainProject.ErrDuplicateName) {
			return gen.CreateProject409ApplicationProblemPlusJSONResponse{
				ConflictApplicationProblemPlusJSONResponse: gen.ConflictApplicationProblemPlusJSONResponse{
					Status: 409,
					Title:  "Conflict",
					Detail: new("A project with this name already exists in this workspace"),
				},
			}, nil
		}
		return gen.CreateProject500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to create project"),
			},
		}, nil
	}

	return gen.CreateProject201JSONResponse(mapDomainProjectToGen(*prj)), nil
}

// GetProject handles GET /ws/{workspace_id}/p/{project_id}
func (h *ProjectHandler) GetProject(
	ctx context.Context,
	req gen.GetProjectRequestObject,
) (gen.GetProjectResponseObject, error) {
	wsID := uuid.UUID(req.WorkspaceId)
	projectID := uuid.UUID(req.ProjectId)

	prj, err := h.projectService.GetByID(ctx, wsID, projectID)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.GetProject401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainProject.ErrNotFound) || errors.Is(err, domainProject.ErrInvalidInput) {
			return gen.GetProject404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Project not found"),
				},
			}, nil
		}
		return gen.GetProject500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to retrieve project"),
			},
		}, nil
	}

	return gen.GetProject200JSONResponse(mapDomainProjectToGen(*prj)), nil
}

// UpdateProject handles PATCH /ws/{workspace_id}/p/{project_id}
func (h *ProjectHandler) UpdateProject(
	ctx context.Context,
	req gen.UpdateProjectRequestObject,
) (gen.UpdateProjectResponseObject, error) {
	if req.Body == nil {
		return gen.UpdateProject400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
				Status: 400,
				Title:  "Bad Request",
				Detail: new("Request body cannot be empty"),
			},
		}, nil
	}

	wsID := uuid.UUID(req.WorkspaceId)
	projectID := uuid.UUID(req.ProjectId)

	var settings map[string]any
	if req.Body.Settings != nil {
		settings = *req.Body.Settings
	}

	input := domainProject.UpdateInput{
		Name:              req.Body.Name,
		TicketIDPrefix:    req.Body.TicketIdPrefix,
		Settings:          settings,
		DefaultHourlyRate: req.Body.DefaultHourlyRate,
		Description:       req.Body.Description,
	}

	prj, err := h.projectService.Update(ctx, wsID, projectID, input)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.UpdateProject401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainProject.ErrInvalidInput) {
			return gen.UpdateProject400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		if errors.Is(err, domainProject.ErrNotFound) {
			return gen.UpdateProject404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Project not found"),
				},
			}, nil
		}
		if errors.Is(err, domainProject.ErrDuplicateName) {
			return gen.UpdateProject409ApplicationProblemPlusJSONResponse{
				ConflictApplicationProblemPlusJSONResponse: gen.ConflictApplicationProblemPlusJSONResponse{
					Status: 409,
					Title:  "Conflict",
					Detail: new("A project with this name already exists in this workspace"),
				},
			}, nil
		}
		return gen.UpdateProject500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to update project"),
			},
		}, nil
	}

	return gen.UpdateProject200JSONResponse(mapDomainProjectToGen(*prj)), nil
}

// DeleteProject handles DELETE /ws/{workspace_id}/p/{project_id}
func (h *ProjectHandler) DeleteProject(
	ctx context.Context,
	req gen.DeleteProjectRequestObject,
) (gen.DeleteProjectResponseObject, error) {
	wsID := uuid.UUID(req.WorkspaceId)
	projectID := uuid.UUID(req.ProjectId)

	if err := h.projectService.Delete(ctx, wsID, projectID); err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.DeleteProject401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainProject.ErrNotFound) {
			return gen.DeleteProject404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Project not found"),
				},
			}, nil
		}
		return gen.DeleteProject500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to delete project"),
			},
		}, nil
	}

	return gen.DeleteProject204Response{}, nil
}

func mapDomainProjectToGen(p domainProject.Project) gen.Project {
	settings := p.Settings
	if settings == nil {
		settings = make(map[string]any)
	}

	return gen.Project{
		Id:                p.ID,
		WorkspaceId:       p.WorkspaceID,
		Name:              p.Name,
		TicketIdPrefix:    p.TicketIDPrefix,
		Settings:          settings,
		DefaultHourlyRate: p.DefaultHourlyRate,
		Description:       p.Description,
		CreatedAt:         p.CreatedAt,
		UpdatedAt:         p.UpdatedAt,
	}
}
