package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/internal/database"
	gen "github.com/samSRaina/kizen/services/workspace-service/internal/api"
	"github.com/samSRaina/kizen/services/workspace-service/internal/config"
	"github.com/samSRaina/kizen/services/workspace-service/internal/service"
)

func main() {
	logger := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	})

	if err := run(logger); err != nil {
		logger.Error("application failed", "error", err)
		os.Exit(1)
	}
}

func run(logger *slog.JSONHandler) error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("Load config: %w", err)
	}

	ctx := context.Background()

	pool, err := NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("create database pool: %w", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("ping database: %w", err)
	}
	logger.Info("database connection established")

	queries := database.New(pool)
	ssi := service.NewServer(queries)
	strictHandler := gen.NewStrictHandler(ssi, nil)

	router := chi.NewRouter()
	router.Route("/api/v1", func(r chi.Router) {
		gen.HandlerFromMux(strictHandler, r)
	})

	// http-server
	server := &http.Server{
		Addr:    net.JoinHostPort("", cfg.Server),
		Handler: router,
	}

	serverErrors := make(chan error, 1)
	go func() {
		logger.Info("server starting", "addr", cfg.Server)
		if err := server.ListenAndServe(); err != nil && errors.Is(err, http.ErrServerClosed) {
			serverErrors <- err
		}
	}()

	//waiting for server failure
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(shutdown)

	select {
	case err := <-serverErrors:
		return err

	case sig := <-shutdown:
		logger.Info("shutdown signal received", "signal", sig)
	}

	//graceful shutdown
	shutdownCtx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second, //timeout to give server time to finish whatever it has been doing
	)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		return err
	}
	logger.Info("server stopped")
	return nil

}

func NewPool(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	return pgxpool.New(ctx, databaseURL)
}
