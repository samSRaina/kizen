package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/internal/database"
)

type Repository struct {
	q *database.Queries
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{
		q: database.New(pool),
	}
}

func (r *Repository) CreateTicket(ctx context.Context, arg database.CreateTicketParams) (database.Ticket, error) {
	return r.q.CreateTicket(ctx, arg)
}
