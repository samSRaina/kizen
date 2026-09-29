package handler

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/internal/middleware"
	"github.com/samSRaina/kizen/services/workspace-service/internal/api"
	"github.com/samSRaina/kizen/services/workspace-service/internal/domain"
)

type Service interface {
	List(ctx context.Context) ([]domain.Workspace, error)
	Create(ctx context.Context, in domain.CreateWorkspaceInput) (*domain.Workspace, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type Handler struct {
	s Service
}

func NewHandler(s Service) *Handler {
	return &Handler{s: s}
}

var _ api.StrictServerInterface = (*Handler)(nil)

func (h *Handler) ListWorkspaces(ctx context.Context, request api.ListWorkspacesRequestObject) (api.ListWorkspacesResponseObject, error) {
	// Let the context propagate directly down to the service & repository.
	// The core business layer shouldn't crash if unauth (handled implicitly or through repository checks).
	// However, we can keep this top level HTTP guard to send proper 401s if context metadata is missing!
	_, ok := middleware.GetUserID(ctx)
	if !ok {
		detail := "unauthorized: missing or invalid authentication token"
		return api.ListWorkspaces401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: api.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: http.StatusUnauthorized,
				Title:  "Unauthorized",
				Detail: &detail,
			},
		}, nil
	}

	workspaces, err := h.s.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("handler: %w", err)
	}

	response := make(api.ListWorkspaces200JSONResponse, len(workspaces))
	for i := range workspaces {
		response[i] = toAPIWorkspace(&workspaces[i])
	}
	return response, nil
}

func (h *Handler) CreateWorkspace(ctx context.Context, request api.CreateWorkspaceRequestObject) (api.CreateWorkspaceResponseObject, error) {
	_, ok := middleware.GetUserID(ctx)
	if !ok {
		detail := "unauthorized: missing or invalid authentication token"
		return api.CreateWorkspace401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: api.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: http.StatusUnauthorized,
				Title:  "Unauthorized",
				Detail: &detail,
			},
		}, nil
	}

	if request.Body == nil {
		detail := "request body is required"
		return api.CreateWorkspace400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: api.BadRequestApplicationProblemPlusJSONResponse{
				Status: http.StatusBadRequest,
				Title:  "Bad Request",
				Detail: &detail,
			},
		}, nil
	}

	in := domain.CreateWorkspaceInput{
		Name:              request.Body.Name,
		DefaultHourlyRate: request.Body.DefaultHourlyRate,
		Description:       request.Body.Description,
	}

	created, err := h.s.Create(ctx, in)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrInvalidInput):
			detail := err.Error()
			return api.CreateWorkspace400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: api.BadRequestApplicationProblemPlusJSONResponse{
					Status: http.StatusBadRequest,
					Title:  "Bad Request",
					Detail: &detail,
				},
			}, nil
		case errors.Is(err, domain.ErrConflict):
			detail := err.Error()
			return api.CreateWorkspace409ApplicationProblemPlusJSONResponse{
				ConflictApplicationProblemPlusJSONResponse: api.ConflictApplicationProblemPlusJSONResponse{
					Status: http.StatusConflict,
					Title:  "Conflict",
					Detail: &detail,
				},
			}, nil
		default:
			return nil, fmt.Errorf("handler: %w", err)
		}
	}
	return api.CreateWorkspace201JSONResponse(toAPIWorkspace(created)), nil
}

func (h *Handler) DeleteWorkspace(ctx context.Context, request api.DeleteWorkspaceRequestObject) (api.DeleteWorkspaceResponseObject, error) {
	_, ok := middleware.GetUserID(ctx)
	if !ok {
		detail := "unauthorized: missing or invalid authentication token"
		return api.DeleteWorkspace401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: api.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: http.StatusUnauthorized,
				Title:  "Unauthorized",
				Detail: &detail,
			},
		}, nil
	}

	err := h.s.Delete(ctx, request.Id)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrNotFound):
			detail := err.Error()
			return api.DeleteWorkspace404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: api.NotFoundApplicationProblemPlusJSONResponse{
					Status: http.StatusNotFound,
					Title:  "Not Found",
					Detail: &detail,
				},
			}, nil
		default:
			return nil, fmt.Errorf("handler: %w", err)
		}
	}
	return api.DeleteWorkspace204Response{}, nil
}

func toAPIWorkspace(ws *domain.Workspace) api.Workspace {
	return api.Workspace{
		Id:                ws.ID,
		OwnerId:           ws.OwnerID,
		Name:              ws.Name,
		DefaultHourlyRate: ws.DefaultHourlyRate,
		Description:       ws.Description,
		CreatedAt:         ws.CreatedAt,
		UpdatedAt:         ws.UpdatedAt,
	}
}
