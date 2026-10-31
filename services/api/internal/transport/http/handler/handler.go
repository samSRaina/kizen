package handler

import "github.com/samSRaina/kizen/api/internal/transport/http/gen"

var _ gen.StrictServerInterface = (*Server)(nil)

type Server struct {
	*WorkspaceHandler
	*TicketHandler
	*TimeEntryHandler
}

func NewServer(wh *WorkspaceHandler, th *TicketHandler, teh *TimeEntryHandler) *Server {
	return &Server{
		WorkspaceHandler: wh,
		TicketHandler:    th,
		TimeEntryHandler: teh,
	}
}
