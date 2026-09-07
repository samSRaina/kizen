package handler

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/google/uuid"
	gen "github.com/samSRaina/kizen/services/ticket-service/internal/api/gen"
	"github.com/samSRaina/kizen/services/ticket-service/internal/domain"
)

// ─────────────────────────────────────────────────────────────────────────────
// HTTP handlers implementing the generated ServerInterface.
//
// The contract (api/openapi.yaml) generates:
//   - ServerInterface — the exact method set handlers must implement
//   - request bodies  — gen.CreateTicketRequest etc.
//   - Problem         — the error shape (see problem.go)
//
// Handlers translate: HTTP ⇄ generated contract types ⇄ domain ⇄ service.
// Every error response goes through respondError (problem.go) — one
// authority, problem+json, correct status, no leaked internals.
// ─────────────────────────────────────────────────────────────────────────────

// TicketService is the transport-facing port the handler depends on — only
// the operations the Tickets contract slice needs, nothing more.
type TicketService interface {
	Create(ctx context.Context, ticket *domain.Ticket) (*domain.Ticket, error)
	GetByID(ctx context.Context, projectID uuid.UUID, identifier string) (*domain.Ticket, error)
	Delete(ctx context.Context, projectID uuid.UUID, identifier string) error
}

// TicketHandler implements gen.ServerInterface. Each method below has the
// exact signature the generated wrapper calls; adding an operation to the
// spec + regenerating makes the compiler demand the new method here.
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

// CreateTicket handles POST /api/v1/projects/{projectId}/tickets.
// The contract says: no identifier on the wire (server-assigned) and the
// reporter comes from the session, never the body.
func (h *TicketHandler) CreateTicket(w http.ResponseWriter, r *http.Request, projectId gen.ProjectId) {
	var req gen.CreateTicketRequest
	if err := decodeJSON(r, &req); err != nil {
		// Decode failures are client errors: malformed JSON, unknown
		// fields (e.g. a smuggled "identifier" — the spec's strict
		// decoder rule), wrong types, body too large.
		respondError(h.logger, w, r, err)
		return
	}

	// Contract body → domain. The reporter is the session user; until the
	// identity module lands there is no session, so a deterministic
	// system UUID stands in (created_by's FK to users is deliberately
	// commented out in the schema until identity exists).
	t := &domain.Ticket{
		ProjectID:   uuid.UUID(projectId),
		Title:       req.Title,
		Description: req.Description,
		Status:      domain.StatusBacklog,
		Priority:    domain.TicketPriority(req.Priority),
		CreatedBy:   systemActorID,
	}

	created, err := h.service.Create(r.Context(), t)
	if err != nil {
		respondError(h.logger, w, r, err)
		return
	}

	respondJSON(w, http.StatusCreated, newTicketResponse(created))
}

// GetTicket handles GET /api/v1/projects/{projectId}/tickets/{identifier}.
func (h *TicketHandler) GetTicket(w http.ResponseWriter, r *http.Request, projectId gen.ProjectId, identifier gen.TicketIdentifier) {
	t, err := h.service.GetByID(r.Context(), uuid.UUID(projectId), identifier)
	if err != nil {
		respondError(h.logger, w, r, err)
		return
	}

	respondJSON(w, http.StatusOK, newTicketResponse(t))
}

// DeleteTicket handles DELETE /api/v1/projects/{projectId}/tickets/{identifier}.
func (h *TicketHandler) DeleteTicket(w http.ResponseWriter, r *http.Request, projectId gen.ProjectId, identifier gen.TicketIdentifier) {
	if err := h.service.Delete(r.Context(), uuid.UUID(projectId), identifier); err != nil {
		respondError(h.logger, w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ListTickets and UpdateTicket are declared in the contract but not yet
// built in the service/repo layers. They answer 501 problem+json — the
// honest "in the contract, not yet in the code" status — until their
// queries and service methods exist. When they do, these handlers shrink to
// the same decode→call→respond shape as the rest.
func (h *TicketHandler) ListTickets(w http.ResponseWriter, r *http.Request, projectId gen.ProjectId, params gen.ListTicketsParams) {
	respondError(h.logger, w, r, errNotImplemented("ListTickets"))
}

func (h *TicketHandler) UpdateTicket(w http.ResponseWriter, r *http.Request, projectId gen.ProjectId, identifier gen.TicketIdentifier) {
	respondError(h.logger, w, r, errNotImplemented("UpdateTicket"))
}

// errNotImplemented builds the 501 problem error. Distinct from 500: a
// client can rely on "designed, not built" vs "something broke".
func errNotImplemented(op string) error {
	return fmt.Errorf("%s: %w", op, errNotImplementedSentinel)
}

var errNotImplementedSentinel = errors.New("not implemented")

// systemActorID is the interim reporter for created_by until the identity
// module provides real sessions. Deterministic (not random) so rows are
// traceable to the pre-identity era in the DB.
var systemActorID = uuid.MustParse("00000000-0000-0000-0000-00000000f00d")
