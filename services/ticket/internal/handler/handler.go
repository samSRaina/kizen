package handler

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/samSRaina/kizen/services/ticket/internal/domain"
)

type TicketService interface {
	Create(ctx context.Context, ticket *domain.Ticket) (*domain.Ticket, error)
	GetByID(ctx context.Context, projectID uuid.UUID, identifier string) (*domain.Ticket, error)
	Delete(ctx context.Context, projectID uuid.UUID, identifier string) error
	ListByProject(ctx context.Context, projectID uuid.UUID) ([]*domain.Ticket, error)
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
	Tags        []string              `json:"tags,omitempty"`
}

func (h *TicketHandler) Create(w http.ResponseWriter, r *http.Request) {
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
			Tags:        ticket.Tags,
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
	pID, err := uuid.Parse(chi.URLParam(r, "project_id"))
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid project id")
		return
	}

	id := chi.URLParam(r, "identifier")
	if id == "" {
		writeJSONError(w, http.StatusBadRequest, "invalid ticket identifier")
		return
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
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(t); err != nil {
		h.logger.Error("failed to encode ticket response", "error", err)
	}
}

func (h *TicketHandler) Delete(w http.ResponseWriter, r *http.Request) {
	pID, err := uuid.Parse(chi.URLParam(r, "project_id"))
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid project id")
		return
	}

	id := chi.URLParam(r, "identifier")
	if id == "" {
		writeJSONError(w, http.StatusBadRequest, "invalid ticket identifier")
		return
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

	w.WriteHeader(http.StatusNoContent)
}

func (h *TicketHandler) ListByProject(w http.ResponseWriter, r *http.Request) {
	pID, err := uuid.Parse(chi.URLParam(r, "project_id"))
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid project id")
		return
	}

	tickets, err := h.service.ListByProject(r.Context(), pID)
	if err != nil {
		h.logger.Error("failed to list tickets", "error", err)
		writeJSONError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(tickets); err != nil {
		h.logger.Error("failed to encode tickets response", "error", err)
	}
}
