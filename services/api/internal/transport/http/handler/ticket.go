package handler

import (
	"context"
	"errors"

	"github.com/google/uuid"
	appTicket "github.com/samSRaina/kizen/api/internal/application/ticket"
	domainTicket "github.com/samSRaina/kizen/api/internal/domain/ticket"
	"github.com/samSRaina/kizen/api/internal/transport/http/gen"
	"github.com/samSRaina/kizen/api/internal/transport/http/middleware"
)

type TicketHandler struct {
	ticketService *appTicket.Service
}

func NewTicketHandler(ticketService *appTicket.Service) *TicketHandler {
	return &TicketHandler{
		ticketService: ticketService,
	}
}

// ListTickets handles GET /workspaces/{workspace_id}/tickets
func (h *TicketHandler) ListTickets(
	ctx context.Context,
	req gen.ListTicketsRequestObject,
) (gen.ListTicketsResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.ListTickets401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	wsID := uuid.UUID(req.WorkspaceId)
	tickets, err := h.ticketService.List(ctx, *caller, wsID)
	if err != nil {
		if errors.Is(err, domainTicket.ErrInvalidInput) {
			return gen.ListTickets404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Workspace not found"),
				},
			}, nil
		}
		return gen.ListTickets500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to retrieve tickets"),
			},
		}, nil
	}

	items := make([]gen.Ticket, len(tickets))
	for i, t := range tickets {
		items[i] = mapDomainTicketToGen(t)
	}

	return gen.ListTickets200JSONResponse(items), nil
}

// CreateTicket handles POST /workspaces/{workspace_id}/tickets
func (h *TicketHandler) CreateTicket(
	ctx context.Context,
	req gen.CreateTicketRequestObject,
) (gen.CreateTicketResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.CreateTicket401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	wsID := uuid.UUID(req.WorkspaceId)

	var status *domainTicket.Status
	if req.Body.Status != nil {
		s := domainTicket.Status(*req.Body.Status)
		status = &s
	}

	points := 0
	if req.Body.Points != nil {
		points = *req.Body.Points
	}

	var tags []string
	if req.Body.Tags != nil {
		tags = *req.Body.Tags
	}

	created, err := h.ticketService.Create(ctx, *caller, wsID, domainTicket.CreateInput{
		Title:       req.Body.Title,
		Description: req.Body.Description,
		Type:        domainTicket.Type(req.Body.Type),
		Status:      status,
		Priority:    domainTicket.Priority(req.Body.Priority),
		Points:      points,
		Tags:        tags,
	})
	if err != nil {
		if errors.Is(err, domainTicket.ErrInvalidInput) {
			return gen.CreateTicket400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		return gen.CreateTicket500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to create ticket"),
			},
		}, nil
	}

	return gen.CreateTicket201JSONResponse(mapDomainTicketToGen(*created)), nil
}

// GetTicket handles GET /workspaces/{workspace_id}/tickets/{identifier}
func (h *TicketHandler) GetTicket(
	ctx context.Context,
	req gen.GetTicketRequestObject,
) (gen.GetTicketResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.GetTicket401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	wsID := uuid.UUID(req.WorkspaceId)
	t, err := h.ticketService.Get(ctx, *caller, wsID, req.Identifier)
	if err != nil {
		if errors.Is(err, domainTicket.ErrNotFound) {
			return gen.GetTicket404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Ticket not found"),
				},
			}, nil
		}
		return gen.GetTicket500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to retrieve ticket"),
			},
		}, nil
	}

	return gen.GetTicket200JSONResponse(mapDomainTicketToGen(*t)), nil
}

// UpdateTicket handles PATCH /workspaces/{workspace_id}/tickets/{identifier}
func (h *TicketHandler) UpdateTicket(
	ctx context.Context,
	req gen.UpdateTicketRequestObject,
) (gen.UpdateTicketResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.UpdateTicket401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	wsID := uuid.UUID(req.WorkspaceId)

	var typePtr *domainTicket.Type
	if req.Body != nil && req.Body.Type != nil {
		t := domainTicket.Type(*req.Body.Type)
		typePtr = &t
	}

	var statusPtr *domainTicket.Status
	if req.Body != nil && req.Body.Status != nil {
		s := domainTicket.Status(*req.Body.Status)
		statusPtr = &s
	}

	var priorityPtr *domainTicket.Priority
	if req.Body != nil && req.Body.Priority != nil {
		p := domainTicket.Priority(*req.Body.Priority)
		priorityPtr = &p
	}

	var desc *string
	var title *string
	var points *int
	var tags *[]string

	if req.Body != nil {
		desc = req.Body.Description
		title = req.Body.Title
		points = req.Body.Points
		tags = req.Body.Tags
	}

	updated, err := h.ticketService.Update(ctx, *caller, wsID, req.Identifier, domainTicket.UpdateInput{
		Title:       title,
		Description: desc,
		Type:        typePtr,
		Status:      statusPtr,
		Priority:    priorityPtr,
		Points:      points,
		Tags:        tags,
	})
	if err != nil {
		if errors.Is(err, domainTicket.ErrNotFound) {
			return gen.UpdateTicket404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Ticket not found"),
				},
			}, nil
		}
		if errors.Is(err, domainTicket.ErrInvalidInput) {
			return gen.UpdateTicket400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		return gen.UpdateTicket500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to update ticket"),
			},
		}, nil
	}

	return gen.UpdateTicket200JSONResponse(mapDomainTicketToGen(*updated)), nil
}

// DeleteTicket handles DELETE /workspaces/{workspace_id}/tickets/{identifier}
func (h *TicketHandler) DeleteTicket(
	ctx context.Context,
	req gen.DeleteTicketRequestObject,
) (gen.DeleteTicketResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.DeleteTicket401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	wsID := uuid.UUID(req.WorkspaceId)
	if err := h.ticketService.Delete(ctx, *caller, wsID, req.Identifier); err != nil {
		if errors.Is(err, domainTicket.ErrNotFound) {
			return gen.DeleteTicket404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Ticket not found"),
				},
			}, nil
		}
		return gen.DeleteTicket500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to delete ticket"),
			},
		}, nil
	}

	return gen.DeleteTicket204Response{}, nil
}

func mapDomainTicketToGen(t domainTicket.Ticket) gen.Ticket {
	tags := t.Tags
	return gen.Ticket{
		Id:          t.ID,
		WorkspaceId: t.WorkspaceID,
		Identifier:  t.Identifier,
		Title:       t.Title,
		Description: t.Description,
		Type:        gen.TicketType(t.Type),
		Status:      gen.TicketStatus(t.Status),
		Priority:    gen.TicketPriority(t.Priority),
		Points:      t.Points,
		Tags:        &tags,
		CreatedAt:   t.CreatedAt,
		UpdatedAt:   t.UpdatedAt,
	}
}
