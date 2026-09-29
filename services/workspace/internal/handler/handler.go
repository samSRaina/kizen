package handler

import (
	"context"
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/internal/middleware"
	"github.com/samSRaina/kizen/services/workspace/internal/api"
	"github.com/samSRaina/kizen/services/workspace/internal/domain"
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

func statusCodeForError(err error) int {
	switch {
	case errors.Is(err, domain.ErrInvalidInput):
		return http.StatusBadRequest
	case errors.Is(err, domain.ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err, domain.ErrConflict):
		return http.StatusConflict
	default:
		return http.StatusInternalServerError
	}
}

// Helpers to quickly map standard status codes back to OpenAPI generated interfaces
func construct400(message string) api.CreateWorkspace400ApplicationProblemPlusJSONResponse {
	return api.CreateWorkspace400ApplicationProblemPlusJSONResponse{
		BadRequestApplicationProblemPlusJSONResponse: api.BadRequestApplicationProblemPlusJSONResponse{
			Status: http.StatusBadRequest,
			Title:  "Bad Request",
			Detail: &message,
		},
	}
}

func construct404(message string) api.DeleteWorkspace404ApplicationProblemPlusJSONResponse {
	return api.DeleteWorkspace404ApplicationProblemPlusJSONResponse{
		NotFoundApplicationProblemPlusJSONResponse: api.NotFoundApplicationProblemPlusJSONResponse{
			Status: http.StatusNotFound,
			Title:  "Not Found",
			Detail: &message,
		},
	}
}

func construct409(message string) api.CreateWorkspace409ApplicationProblemPlusJSONResponse {
	return api.CreateWorkspace409ApplicationProblemPlusJSONResponse{
		ConflictApplicationProblemPlusJSONResponse: api.ConflictApplicationProblemPlusJSONResponse{
			Status: http.StatusConflict,
			Title:  "Conflict",
			Detail: &message,
		},
	}
}

func (h *Handler) ListWorkspaces(ctx context.Context, request api.ListWorkspacesRequestObject) (api.ListWorkspacesResponseObject, error) {
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
		logger := middleware.GetLogger(ctx)
		logger.Error("failed to list workspaces", "error", err)
		return nil, err // Returning actual standard error triggers 500 handler boundary
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
		return construct400("request body is required"), nil
	}

	in := domain.CreateWorkspaceInput{
		Name:              request.Body.Name,
		DefaultHourlyRate: request.Body.DefaultHourlyRate,
		Description:       request.Body.Description,
	}

	created, err := h.s.Create(ctx, in)
	if err != nil {
		switch statusCodeForError(err) {
		case http.StatusBadRequest:
			return construct400(err.Error()), nil
		case http.StatusConflict:
			return construct409(err.Error()), nil
		default:
			// Internal failure -> Log it and bubble to standard 500 router boundary
			logger := middleware.GetLogger(ctx)
			logger.Error("failed to create workspace", "error", err)
			return nil, err
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
		switch statusCodeForError(err) {
		case http.StatusNotFound:
			return construct404(err.Error()), nil
		default:
			logger := middleware.GetLogger(ctx)
			logger.Error("failed to delete workspace",
				"error", err,
				"workspace_id", request.Id.String(),
			)
			return nil, err
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
