package handler

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/internal/middleware"
	"github.com/samSRaina/kizen/services/workspace-service/internal/api"
	"github.com/samSRaina/kizen/services/workspace-service/internal/domain"
)

type Service interface {
	List(ctx context.Context, ownerID string) ([]domain.Workspace, error)
	Create(ctx context.Context, in domain.CreateWorkspaceInput) (*domain.Workspace, error)
	Delete(ctx context.Context, id uuid.UUID, ownerID string) error
}

type Handler struct {
	s Service
}

func NewHandler(s Service) *Handler {
	return &Handler{s: s}
}

var _ api.StrictServerInterface = (*Handler)(nil)

func (h *Handler) ListWorkspaces(ctx context.Context, request api.ListWorkspacesRequestObject) (api.ListWorkspacesResponseObject, error) {
	userID, ok := middleware.GetUserID(ctx)
	if !ok || strings.TrimSpace(userID) == "" {
		detail := "unauthorized: missing or invalid authentication token"
		return api.ListWorkspaces401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: api.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: http.StatusUnauthorized,
				Title:  "Unauthorized",
				Detail: &detail,
			},
		}, nil
	}

	workspaces, err := h.s.List(ctx, userID)
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
	userID, ok := middleware.GetUserID(ctx)
	if !ok || strings.TrimSpace(userID) == "" {
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
		OwnerID:           userID,
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
	userID, ok := middleware.GetUserID(ctx)
	if !ok || strings.TrimSpace(userID) == "" {
		detail := "unauthorized: missing or invalid authentication token"
		return api.DeleteWorkspace401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: api.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: http.StatusUnauthorized,
				Title:  "Unauthorized",
				Detail: &detail,
			},
		}, nil
	}

	err := h.s.Delete(ctx, request.Id, userID)
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
