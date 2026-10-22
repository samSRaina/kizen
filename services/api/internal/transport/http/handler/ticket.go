package handler

import (
	"context"

	"github.com/samSRaina/kizen/api/internal/transport/http/gen"
)

func (h *Handler) ListTickets(ctx context.Context, req gen.ListTicketsRequestObject) (gen.ListTicketsResponseObject, error) {
	return gen.ListTickets500ApplicationProblemPlusJSONResponse{Status: 500, Title: "Not Implemented"}, nil
}

func (h *Handler) CreateTicket(ctx context.Context, req gen.CreateTicketRequestObject) (gen.CreateTicketResponseObject, error) {
	return gen.CreateTicket500ApplicationProblemPlusJSONResponse{Status: 500, Title: "Not Implemented"}, nil
}

func (h *Handler) GetTicket(ctx context.Context, req gen.GetTicketRequestObject) (gen.GetTicketResponseObject, error) {
	return gen.GetTicket500ApplicationProblemPlusJSONResponse{Status: 500, Title: "Not Implemented"}, nil
}

func (h *Handler) UpdateTicket(ctx context.Context, req gen.UpdateTicketRequestObject) (gen.UpdateTicketResponseObject, error) {
	return gen.UpdateTicket500ApplicationProblemPlusJSONResponse{Status: 500, Title: "Not Implemented"}, nil
}

func (h *Handler) DeleteTicket(ctx context.Context, req gen.DeleteTicketRequestObject) (gen.DeleteTicketResponseObject, error) {
	return gen.DeleteTicket500ApplicationProblemPlusJSONResponse{Status: 500, Title: "Not Implemented"}, nil
}
