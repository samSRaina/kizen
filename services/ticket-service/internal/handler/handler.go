package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/services/ticket-service/internal/domain"
)

type TicketService interface {
	Create(ctx context.Context, ticket *domain.Ticket) (*domain.Ticket, error)
}

type TicketHandler struct {
	service TicketService
}

func NewTicketHandler(service TicketService) *TicketHandler {
	return &TicketHandler{
		service: service,
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
		http.Error(w, "invalid request body", http.StatusBadRequest)
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
		http.Error(w, fmt.Errorf("%s: %w", op, err).Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(createdTicket); err != nil {
		return
	}

}
