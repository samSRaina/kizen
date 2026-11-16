package handler

import "github.com/samSRaina/kizen/api/internal/transport/http/gen"

var _ gen.StrictServerInterface = (*Server)(nil)

type Server struct {
	*WorkspaceHandler
	*ProjectHandler
	*TicketHandler
	*TrackHandler
}

func NewServer(wh *WorkspaceHandler, ph *ProjectHandler, th *TicketHandler, trh *TrackHandler) *Server {
	return &Server{
		WorkspaceHandler: wh,
		ProjectHandler:   ph,
		TicketHandler:    th,
		TrackHandler:     trh,
	}
}
