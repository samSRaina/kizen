package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// The Pool function opens a new pgx connection pool for the given databaseURL
func Pool(ctx context.Context, connString string) (*pgxpool.Pool, error) {
	return pgxpool.New(ctx, connString)
}
