package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPool(ctx context.Context, connString string) (*pgxpool.Pool, error) {
	pool, err := pgxpool.New(ctx, connString)
	if err != nil {
		return nil, fmt.Errorf("postgres connect pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("postgres ping: %w", err)
	}

	return pool, nil
}

// // PoolOption defines a functional option for configuring the pgx connection pool.
// type PoolOption func(*pgxpool.Config)
//
// // WithMaxConns sets the maximum number of connections in the pool.
// func WithMaxConns(n int32) PoolOption {
// 	return func(c *pgxpool.Config) { c.MaxConns = n }
// }
//
// // WithMinConns sets the minimum idle connections in the pool.
// func WithMinConns(n int32) PoolOption {
// 	return func(c *pgxpool.Config) { c.MinConns = n }
// }
//
// // WithMaxConnIdleTime sets the maximum time a connection may remain idle.
// func WithMaxConnIdleTime(d time.Duration) PoolOption {
// 	return func(c *pgxpool.Config) { c.MaxConnIdleTime = d }
// }
//
// // WithMaxConnLifetime sets the maximum lifetime of a connection.
// func WithMaxConnLifetime(d time.Duration) PoolOption {
// 	return func(c *pgxpool.Config) { c.MaxConnLifetime = d }
// }
//
// // NewPool initializes a bounded pgx connection pool with production-grade defaults.
// func NewPool(ctx context.Context, connString string, opts ...PoolOption) (*pgxpool.Pool, error) {
// 	config, err := pgxpool.ParseConfig(connString)
// 	if err != nil {
// 		return nil, fmt.Errorf("postgres parse config: %w", err)
// 	}
//
// 	// Sane production defaults (Limit everything)
// 	config.MaxConns = 25
// 	config.MinConns = 5
// 	config.MaxConnIdleTime = 15 * time.Minute
// 	config.MaxConnLifetime = 1 * time.Hour
//
// 	for _, opt := range opts {
// 		opt(config)
// 	}
//
// 	pool, err := pgxpool.NewWithConfig(ctx, config)
// 	if err != nil {
// 		return nil, fmt.Errorf("postgres connect pool: %w", err)
// 	}
//
// 	if err := pool.Ping(ctx); err != nil {
// 		pool.Close()
// 		return nil, fmt.Errorf("postgres ping: %w", err)
// 	}
//
// 	return pool, nil
// }
