package handler

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/samSRaina/kizen/services/ticket-service/internal/domain"
)

type TicketService interface {
	Create(ctx context.Context, ticket *domain.Ticket) (*domain.Ticket, error)
	GetByID(ctx context.Context, project_id uuid.UUID, identifier string) (*domain.Ticket, error)
	Delete(ctx context.Context, projectID uuid.UUID, identifier string) error
}

type TicketHandler struct {
	service TicketService
	logger  *slog.Logger
}

func NewTicketHandler(service TicketService, logger *slog.Logger) *TicketHandler {
	return &TicketHandler{
		service: service,
		logger:  logger,
	}
}

type createTicketRequest struct {
	ProjectID   uuid.UUID             `json:"project_id"`
	Identifier  string                `json:"identifier"`
	Title       string                `json:"title"`
	Description string                `json:"description"`
	Priority    domain.TicketPriority `json:"priority"`
	CreatedBy   uuid.UUID             `json:"created_by"`
}

func (h *TicketHandler) Create(w http.ResponseWriter, r *http.Request) {
	const op = "ticket.handler.Create"
	var ticket createTicketRequest

	if err := json.NewDecoder(r.Body).Decode(&ticket); err != nil {
		writeJSONError(w, http.StatusBadRequest, "failed to parse json data")
		return
	}

	createdTicket, err := h.service.Create(
		r.Context(),
		&domain.Ticket{
			ProjectID:   ticket.ProjectID,
			Identifier:  ticket.Identifier,
			Title:       ticket.Title,
			Description: ticket.Description,
			Status:      domain.StatusBacklog,
			Priority:    ticket.Priority,
			CreatedBy:   ticket.CreatedBy,
		},
	)

	if err != nil {
		switch {
		case errors.Is(err, domain.ErrInvalidTicket):
			h.logger.Warn("invalid ticket", "error", err)
			writeJSONError(w, http.StatusBadRequest, "invalid request")

		case errors.Is(err, domain.ErrTicketExists):
			h.logger.Warn(
				"ticket already exists",
				"error", err,
				"project_id", ticket.ProjectID,
				"identifier", ticket.Identifier,
			)
			writeJSONError(w, http.StatusConflict, "ticket already exists")

		default:
			h.logger.Error("failed to create ticket", "error", err)
			writeJSONError(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(createdTicket); err != nil {
		h.logger.Error("failed to encode ticket response", "error", err)
	}

}

func (h *TicketHandler) Get(w http.ResponseWriter, r *http.Request) {
	const op = "ticket.handler.Get"

	pID, err := uuid.Parse(chi.URLParam(r, "project_id"))
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid project id")
	}

	id := chi.URLParam(r, "identifier")
	if id == "" {
		writeJSONError(w, http.StatusBadRequest, "invalid ticket identifier")
	}

	t, err := h.service.GetByID(r.Context(), pID, id)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrTicketNotFound):
			h.logger.Warn("ticket not found", "error", err)
			writeJSONError(w, http.StatusNotFound, "ticket not found")

		default:
			h.logger.Error("failed to get ticket", "error", err)
			writeJSONError(w, http.StatusInternalServerError, "internal server error")
		}

		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK) //200 OK FOR A GET REQUEST INSTEAD OF StatusCreated.

	if err := json.NewEncoder(w).Encode(t); err != nil {
		h.logger.Error("failed to encode ticket response", "error", err)
	}

}

func (h *TicketHandler) Delete(w http.ResponseWriter, r *http.Request) {
	const op = "ticket.handler.Delete"

	pID, err := uuid.Parse(chi.URLParam(r, "project_id"))
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid project id")
	}

	id := chi.URLParam(r, "identifier")
	if id == "" {
		writeJSONError(w, http.StatusBadRequest, "invalid ticket identifier")
	}

	err = h.service.Delete(r.Context(), pID, id)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrTicketNotFound):
			h.logger.Warn("ticket not found", "error", err)
			writeJSONError(w, http.StatusNotFound, "ticket not found")

		default:
			h.logger.Error("failed to delete ticket", "error", err)
			writeJSONError(w, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	//no need for writing header, because no body is being returned
	//w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNoContent)

	// if err := json.NewEncoder(w).Encode(w); err != nil {
	// 	h.logger.Error("failed to encode ticket response", "error", err)
	// }

}
