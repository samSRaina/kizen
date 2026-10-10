package service

import (
	"context"
	"fmt"
	"math/rand"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/internal/database"
	"github.com/samSRaina/kizen/services/ticket/internal/infrastructure/repository"
)

type Service struct {
	repo *repository.Repository
}

func NewService(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateTicket(ctx context.Context, wsID uuid.UUID, params database.CreateTicketParams) (database.Ticket, error) {
    // Basic identifier generation KIZ-XXX
    params.Identifier = fmt.Sprintf("KIZ-%d", rand.Intn(9000)+1000)
    params.WorkspaceID = wsID
	return s.repo.DB().CreateTicket(ctx, params)
}

func (s *Service) ListTicketsByWorkspace(ctx context.Context, wsID uuid.UUID) ([]database.Ticket, error) {
	return s.repo.DB().ListTicketsByWorkspace(ctx, wsID)
}

func (s *Service) GetTicket(ctx context.Context, wsID uuid.UUID, identifier string) (database.Ticket, error) {
	return s.repo.DB().GetTicket(ctx, database.GetTicketParams{
		WorkspaceID: wsID,
		Identifier:  identifier,
	})
}

func (s *Service) UpdateTicket(ctx context.Context, params database.UpdateTicketParams) (database.Ticket, error) {
	return s.repo.DB().UpdateTicket(ctx, params)
}

func (s *Service) DeleteTicket(ctx context.Context, wsID uuid.UUID, identifier string) error {
	_, err := s.repo.DB().DeleteTicket(ctx, database.DeleteTicketParams{
		WorkspaceID: wsID,
		Identifier:  identifier,
	})
    return err
}
