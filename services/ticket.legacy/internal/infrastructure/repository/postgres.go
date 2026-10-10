package repository

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/internal/database"
)

type Repository struct {
	pool    *pgxpool.Pool
	queries *database.Queries
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{
		pool:    pool,
		queries: database.New(pool),
	}
}

func (r *Repository) DB() *database.Queries {
	return r.queries
}
