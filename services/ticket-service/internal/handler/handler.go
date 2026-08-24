package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

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
	Title       string
	Description string
	Priority    domain.TicketPriority
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
			Title:       ticket.Title,
			Description: ticket.Description,
			Priority:    ticket.Priority,
		},
	)
	if err != nil {
		http.Error(w, fmt.Errorf("%s: %w", op, err).Error(), http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(createdTicket); err != nil {
		return
	}

}
