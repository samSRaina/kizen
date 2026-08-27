package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/internal/database"
	"github.com/samSRaina/kizen/services/ticket-service/internal/domain"
)

type TicketRepository struct {
	q *database.Queries
}

func NewTicketRepository(pool *pgxpool.Pool) *TicketRepository {
	return &TicketRepository{
		q: database.New(pool),
	}
}

// func (r *TicketRepository) CreateTicket(ctx context.Context, ticket *domain.Ticket) (*domain.Ticket, error) {
// 	conn, err := pgx.Connect(ctx, "user")

// }

func (r *TicketRepository) Create(ctx context.Context, ticket *domain.Ticket) (*domain.Ticket, error) {
	row, err := r.q.CreateTicket(ctx, database.CreateTicketParams{
		ProjectID:   pgtype.UUID{Bytes: ticket.ProjectID, Valid: true},
		Identifier:  ticket.Identifier,
		Title:       ticket.Title,
		Description: ticket.Description,
		Status:      database.Status(ticket.Status),
		Priority:    database.Priority(ticket.Priority),
		CreatedBy:   pgtype.UUID{Bytes: ticket.CreatedBy, Valid: true},
	})
	if err != nil {
		var pgErr *pgconn.PgError

		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, domain.ErrTicketExists
		}

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
