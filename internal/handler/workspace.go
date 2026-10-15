package handler

import (
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/samSRaina/kizen/internal/domain/workspace"
	"github.com/samSRaina/kizen/internal/platform/httpx"
	"github.com/samSRaina/kizen/internal/service"
	"github.com/samSRaina/kizen/internal/transport/http/middleware"
)

type WorkspaceHandler struct {
	service service.WorkspaceService
}

func NewWorkspaceHandler(service service.WorkspaceService) *WorkspaceHandler {
	return &WorkspaceHandler{service: service}
}

// List handles GET /workspaces
func (h *WorkspaceHandler) List(w http.ResponseWriter, r *http.Request) {
	caller, ok := middleware.FromContext(r.Context())
	if !ok {
		httpx.Unauthorized(w, "Authentication required")
		return
	}

	workspaces, err := h.service.List(r.Context(), *caller)
	if err != nil {
		httpx.InternalServerError(w, "Failed to retrieve workspaces")
		return
	}

	httpx.JSON(w, http.StatusOK, workspaces)
}

// Create handles POST /workspaces
func (h *WorkspaceHandler) Create(w http.ResponseWriter, r *http.Request) {
	caller, ok := middleware.FromContext(r.Context())
	if !ok {
		httpx.Unauthorized(w, "Authentication required")
		return
	}

	var req struct {
		Name              string  `json:"name"`
		DefaultHourlyRate int     `json:"default_hourly_rate"`
		Description       *string `json:"description"`
	}

	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.BadRequest(w, err.Error())
		return
	}

	ws, err := h.service.Create(r.Context(), *caller, workspace.CreateWorkspaceInput{
		Name:              req.Name,
		DefaultHourlyRate: req.DefaultHourlyRate,
		Description:       req.Description,
	})
	if err != nil {
		if errors.Is(err, service.ErrInvalidInput) {
			httpx.BadRequest(w, err.Error())
			return
		}
		httpx.InternalServerError(w, "Failed to create workspace")
		return
	}

	httpx.JSON(w, http.StatusCreated, ws)
}

// Delete handles DELETE /workspaces/{id}
func (h *WorkspaceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	caller, ok := middleware.FromContext(r.Context())
	if !ok {
		httpx.Unauthorized(w, "Authentication required")
		return
	}

	idParam := chi.URLParam(r, "id")
	wsID, err := uuid.Parse(idParam)
	if err != nil {
		httpx.BadRequest(w, "Invalid workspace UUID format")
		return
	}

	err = h.service.Delete(r.Context(), *caller, wsID)
	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			httpx.NotFound(w, "Workspace not found or unauthorized")
			return
		}
		httpx.InternalServerError(w, "Failed to delete workspace")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
