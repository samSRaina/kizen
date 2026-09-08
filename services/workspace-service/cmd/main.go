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

	"github.com/samSRaina/kizen/internal/config"
	"github.com/samSRaina/kizen/internal/database"
	"github.com/samSRaina/kizen/services/workspace-service/internal/postgres"
	"github.com/samSRaina/kizen/services/workspace-service/internal/server"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	if err := run(logger); err != nil {
		logger.Error("application failed", "error", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	cfg, err := config.Load("WORKSPACE_SERVICE")
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	ctx := context.Background()
	pool, err := postgres.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("create database pool: %w", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("ping database: %w", err)
	}
	logger.Info("database connection established")

	handler := server.Router(logger, database.New(pool), pool.Ping)

	srv := &http.Server{
		Addr:         net.JoinHostPort("", cfg.Port),
		Handler:      handler,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	serverErrors := make(chan error, 1)
	go func() {
		logger.Info("server starting", "addr", srv.Addr)
		// ErrServerClosed is the normal shutdown path, not a failure.
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErrors <- err
		}
	}()

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(shutdown)

	select {
	case err := <-serverErrors:
		return err

	case sig := <-shutdown:
		logger.Info("shutdown signal received", "signal", sig)
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), srv.WriteTimeout)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		return err
	}
	logger.Info("server stopped")
	return nil
}
