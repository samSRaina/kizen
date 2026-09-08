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
	"github.com/samSRaina/kizen/internal/config"
	"github.com/samSRaina/kizen/services/ticket-service/internal/handler"
	"github.com/samSRaina/kizen/services/ticket-service/internal/infrastructure/database"
	"github.com/samSRaina/kizen/services/ticket-service/internal/infrastructure/repository"
	"github.com/samSRaina/kizen/services/ticket-service/internal/service"
)

func main() {
	logger := slog.New(
		slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelInfo,
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

	ctx := context.Background()
	//database
	pool, err := database.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("create database pool: %w", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("ping database: %v", err)
	}
	logger.Info("database connection established")

	// wiring
	repo := repository.NewTicketRepository(pool)
	service := service.NewService(repo)
	ticketHandler := handler.NewTicketHandler(service, logger)

	// router
	router := chi.NewRouter()
	router.Post("/api/v1/tickets", ticketHandler.Create)
	router.Get("/api/v1/tickets/{id}", ticketHandler.Get)
	router.Delete("/api/v1/projects/{project_id}/tickets/{id}", ticketHandler.Delete)

	// http-server
	server := &http.Server{
		Addr:    net.JoinHostPort("", cfg.ServerPort),
		Handler: router,
	}

	//star server
	serverErrors := make(chan error, 1)
	go func() {
		logger.Info("server starting", "addr", cfg.ServerPort)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
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
