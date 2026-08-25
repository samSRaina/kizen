package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/internal/database/postgres"
	"github.com/samSRaina/kizen/services/ticket-service/internal/domain"
)

type TicketRepository struct {
	q *postgres.Queries
}

func NewTicketRepository(pool *pgxpool.Pool) *TicketRepository {
	return &TicketRepository{
		q: postgres.New(pool),
	}
}

// func (r *TicketRepository) CreateTicket(ctx context.Context, ticket *domain.Ticket) (*domain.Ticket, error) {
// 	conn, err := pgx.Connect(ctx, "user")

// }

func (r *TicketRepository) Create(ctx context.Context, ticket *domain.Ticket) (*domain.Ticket, error) {
	row, err := r.q.CreateTicket(ctx, postgres.CreateTicketParams{
		ProjectID:   pgtype.UUID{Bytes: ticket.ProjectID, Valid: true},
		Identifier:  ticket.Identifier,
		Title:       ticket.Title,
		Description: ticket.Description,
		Status:      postgres.Status(ticket.Status),
		Priority:    postgres.Priority(ticket.Priority),
		CreatedBy:   pgtype.UUID{Bytes: ticket.CreatedBy, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	return &domain.Ticket{
		ID:          uuid.UUID(row.ID.Bytes),
		ProjectID:   uuid.UUID(row.ProjectID.Bytes),
		Identifier:  row.Identifier,
		Title:       row.Title,
		Description: row.Description,
		Status:      domain.TicketStatus(row.Status),
		Priority:    domain.TicketPriority(row.Priority),
		CreatedBy:   uuid.UUID(row.CreatedBy.Bytes),
		CreatedAt:   row.CreatedAt.Time,
		UpdatedAt:   row.UpdatedAt.Time,
	}, nil
}
