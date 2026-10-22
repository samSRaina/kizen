package ticket

import (
	"log/slog"

	"github.com/samSRaina/kizen/api/internal/application/ports"
)

type Service struct {
	repo ports.TicketRepository
	log  *slog.Logger
}

func NewService(repo ports.TicketRepository, log *slog.Logger) *Service {
	return &Service{repo: repo, log: log}
}
