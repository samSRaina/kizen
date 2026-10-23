package handler

import "github.com/samSRaina/kizen/api/internal/transport/http/gen"

var _ gen.StrictServerInterface = (*Server)(nil)

type Server struct {
	*WorkspaceHandler
	*TicketHandler
}

func NewServer(wh *WorkspaceHandler, th *TicketHandler) *Server {
	return &Server{
		WorkspaceHandler: wh,
		TicketHandler:    th,
	}
}
