package handler

import (
	"context"
	"fmt"

	"github.com/samSRaina/kizen/internal/database"
	"github.com/samSRaina/kizen/services/ticket/internal/api"
	"github.com/samSRaina/kizen/services/ticket/internal/service"
)

type Handler struct {
	srv *service.Service
}

func NewHandler(srv *service.Service) *Handler {
	return &Handler{srv: srv}
}

// Ensure Handler implements api.StrictServerInterface
var _ api.StrictServerInterface = (*Handler)(nil)

// Stubs for Workspace endpoints (these are routed to the workspace-service in production)
func (h *Handler) ListWorkspaces(ctx context.Context, request api.ListWorkspacesRequestObject) (api.ListWorkspacesResponseObject, error) {
	return nil, fmt.Errorf("not implemented in ticket service")
}

func (h *Handler) CreateWorkspace(ctx context.Context, request api.CreateWorkspaceRequestObject) (api.CreateWorkspaceResponseObject, error) {
	return nil, fmt.Errorf("not implemented in ticket service")
}

func (h *Handler) DeleteWorkspace(ctx context.Context, request api.DeleteWorkspaceRequestObject) (api.DeleteWorkspaceResponseObject, error) {
	return nil, fmt.Errorf("not implemented in ticket service")
}

func (h *Handler) ListTickets(ctx context.Context, request api.ListTicketsRequestObject) (api.ListTicketsResponseObject, error) {
	tickets, err := h.srv.ListTicketsByWorkspace(ctx, request.WorkspaceId)
	if err != nil {
		return nil, fmt.Errorf("list tickets: %w", err)
	}

	var res []api.Ticket
	for _, t := range tickets {
		res = append(res, mapTicket(t))
	}
	return api.ListTickets200JSONResponse(res), nil
}

func (h *Handler) CreateTicket(ctx context.Context, request api.CreateTicketRequestObject) (api.CreateTicketResponseObject, error) {
	desc := ""
	if request.Body.Description != nil {
		desc = *request.Body.Description
	}
	pts := int32(0)
	if request.Body.Points != nil {
		pts = int32(*request.Body.Points)
	}
	tags := []string{}
	if request.Body.Tags != nil {
		tags = *request.Body.Tags
	}
	status := database.TicketStatusTodo
	if request.Body.Status != nil {
		status = database.TicketStatus(*request.Body.Status)
	}

	params := database.CreateTicketParams{
		WorkspaceID: request.WorkspaceId,
		Title:       request.Body.Title,
		Description: desc,
		Type:        database.TicketType(request.Body.Type),
		Priority:    database.TicketPriority(request.Body.Priority),
		Status:      status,
		Points:      pts,
		AssigneeID:  request.Body.AssigneeId,
		Tags:        tags,
	}

	t, err := h.srv.CreateTicket(ctx, request.WorkspaceId, params)
	if err != nil {
		return nil, fmt.Errorf("create ticket: %w", err)
	}

	return api.CreateTicket201JSONResponse(mapTicket(t)), nil
}

func (h *Handler) GetTicket(ctx context.Context, request api.GetTicketRequestObject) (api.GetTicketResponseObject, error) {
	t, err := h.srv.GetTicket(ctx, request.WorkspaceId, request.Identifier)
	if err != nil {
		return api.GetTicket404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: api.NotFoundApplicationProblemPlusJSONResponse{
				Title:  "Not Found",
				Status: 404,
			},
		}, nil
	}
	return api.GetTicket200JSONResponse(mapTicket(t)), nil
}

func (h *Handler) UpdateTicket(ctx context.Context, request api.UpdateTicketRequestObject) (api.UpdateTicketResponseObject, error) {
	params := database.UpdateTicketParams{
		WorkspaceID: request.WorkspaceId,
		Identifier:  request.Identifier,
	}
	if request.Body.Title != nil {
		params.Title = *request.Body.Title
	}
	if request.Body.Description != nil {
		params.Description = *request.Body.Description
	}
	if request.Body.Type != nil {
		params.Type = string(*request.Body.Type)
	}
	if request.Body.Priority != nil {
		params.Priority = string(*request.Body.Priority)
	}
	if request.Body.Status != nil {
		params.Status = string(*request.Body.Status)
	}
	if request.Body.Points != nil {
		params.Points = int32(*request.Body.Points)
	}
	if request.Body.AssigneeId != nil {
		params.AssigneeID = *request.Body.AssigneeId
	}

	t, err := h.srv.UpdateTicket(ctx, params)
	if err != nil {
		return api.UpdateTicket404ApplicationProblemPlusJSONResponse{
            NotFoundApplicationProblemPlusJSONResponse: api.NotFoundApplicationProblemPlusJSONResponse{
				Title:  "Not Found",
				Status: 404,
			},
		}, nil
	}
	return api.UpdateTicket200JSONResponse(mapTicket(t)), nil
}

func (h *Handler) DeleteTicket(ctx context.Context, request api.DeleteTicketRequestObject) (api.DeleteTicketResponseObject, error) {
	err := h.srv.DeleteTicket(ctx, request.WorkspaceId, request.Identifier)
	if err != nil {
		return nil, fmt.Errorf("delete ticket: %w", err)
	}
	return api.DeleteTicket204Response{}, nil
}

func mapTicket(t database.Ticket) api.Ticket {
	return api.Ticket{
		Id:          t.ID,
		WorkspaceId: t.WorkspaceID,
		Identifier:  t.Identifier,
		Title:       t.Title,
		Description: &t.Description,
		Type:        api.TicketType(t.Type),
		Status:      api.TicketStatus(t.Status),
		Priority:    api.TicketPriority(t.Priority),
		Points:      int(t.Points),
		AssigneeId:  t.AssigneeID,
		Tags:        &t.Tags,
		CreatedAt:   t.CreatedAt.Time,
		UpdatedAt:   t.UpdatedAt.Time,
	}
}
