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
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/internal/config"
	customMiddleware "github.com/samSRaina/kizen/internal/middleware"
	"github.com/samSRaina/kizen/services/workspace/internal/api"
	"github.com/samSRaina/kizen/services/workspace/internal/handler"
	"github.com/samSRaina/kizen/services/workspace/internal/infrastructure/repository"
	"github.com/samSRaina/kizen/services/workspace/internal/service"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		AddSource: true,
	}))

	if err := run(logger); err != nil {
		logger.Error("application failed", "error", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	cfg, err := config.Load("WORKSPACE_SERVICE")
	if err != nil {
		return fmt.Errorf("Load config: %w", err)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("Create database pool: %w", err)
	}
	defer pool.Close()

	repo := repository.NewRepository(pool)
	srv := service.NewService(repo)
	handler := handler.NewHandler(srv)

	strictHandler := api.NewStrictHandlerWithOptions(handler, nil, api.StrictHTTPServerOptions{
		ResponseErrorHandlerFunc: func(w http.ResponseWriter, r *http.Request, err error) {
			reqLogger := customMiddleware.GetLogger(r.Context())

			// Log the REAL error securely into your own console/logs
			reqLogger.Error("Unhandled request error",
				"error", err.Error(),
				"path", r.URL.Path,
				"method", r.Method,
			)

			// Return a safe, generic error to the actual client
			w.Header().Set("Content-Type", "application/problem+json")
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{"status": 500, "title": "Internal Server Error", "detail": "An unexpected server failure occurred."}`))
		},
	})

	// the middleware injection is ordered and strict. Do not randomly change
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(customMiddleware.RequireAuth)
	r.Use(customMiddleware.InjectLogger(logger))

	api.HandlerFromMux(strictHandler, r)

	server := &http.Server{
		Addr:              net.JoinHostPort("", cfg.Port),
		Handler:           r,
		ReadTimeout:       5 * time.Second,
		ReadHeaderTimeout: 2 * time.Second, //for mitigating slow loris attacks
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       30 * time.Second,
	}

	serverErrors := make(chan error, 1)
	go func() {
		logger.Info("server starting", "addr", server.Addr)
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
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		return err
	}
	logger.Info("server stopped")
	return nil
}
