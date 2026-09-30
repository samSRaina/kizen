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
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/internal/config"
	customMiddleware "github.com/samSRaina/kizen/internal/middleware"
	"github.com/samSRaina/kizen/services/ticket/internal/handler"
	"github.com/samSRaina/kizen/services/ticket/internal/infrastructure/repository"
	"github.com/samSRaina/kizen/services/ticket/internal/service"
)

func main() {
	logger := slog.New(
		slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			AddSource: true,
			Level:     slog.LevelInfo,
		}),
	)

	if err := run(logger); err != nil {
		logger.Error("application failed", "error", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	cfg, err := config.Load("TICKET_SERVICE")
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("create database pool: %w", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("ping database: %w", err)
	}
	logger.Info("database connection established")

	// Wiring
	repo := repository.NewTicketRepository(pool)
	ticketService := service.NewService(repo)
	ticketHandler := handler.NewTicketHandler(ticketService, logger)

	// Router with production-grade middleware
	router := chi.NewRouter()
	router.Use(chiMiddleware.RequestID)
	router.Use(chiMiddleware.Logger)
	router.Use(chiMiddleware.Recoverer)
	router.Use(customMiddleware.RequireAuth)
	router.Use(customMiddleware.InjectLogger(logger))

	router.Post("/api/v1/tickets", ticketHandler.Create)
	router.Get("/api/v1/projects/{project_id}/tickets/{identifier}", ticketHandler.Get)
	router.Delete("/api/v1/projects/{project_id}/tickets/{identifier}", ticketHandler.Delete)
	router.Get("/api/v1/projects/{project_id}/tickets", ticketHandler.ListByProject)

	server := &http.Server{
		Addr:              net.JoinHostPort("", cfg.Port),
		Handler:           router,
		ReadTimeout:       5 * time.Second,
		ReadHeaderTimeout: 2 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       30 * time.Second,
	}

	serverErrors := make(chan error, 1)
	go func() {
		logger.Info("ticket service starting", "addr", server.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErrors <- err
		}
	}()

	select {
	case err := <-serverErrors:
		return err
	case <-ctx.Done():
		logger.Info("shutdown signal received")
	}

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		return err
	}
	logger.Info("ticket service stopped")
	return nil
}
