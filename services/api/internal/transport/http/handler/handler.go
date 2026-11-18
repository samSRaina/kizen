package handler

import "github.com/samSRaina/kizen/api/internal/transport/http/gen"

var _ gen.StrictServerInterface = (*Server)(nil)

type Server struct {
	*WorkspaceHandler
	*ProjectHandler
	*TaskHandler
	*TrackHandler
}

func NewServer(wh *WorkspaceHandler, ph *ProjectHandler, th *TaskHandler, trh *TrackHandler) *Server {
	return &Server{
		WorkspaceHandler: wh,
		ProjectHandler:   ph,
		TaskHandler:      th,
		TrackHandler:     trh,
	}
}
