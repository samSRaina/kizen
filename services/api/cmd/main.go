package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/samSRaina/kizen/api/internal/application/ports"
	appTicket "github.com/samSRaina/kizen/api/internal/application/ticket"
	appTimeEntry "github.com/samSRaina/kizen/api/internal/application/timeentry"
	appWorkspace "github.com/samSRaina/kizen/api/internal/application/workspace"
	"github.com/samSRaina/kizen/api/internal/infrastructure/auth/jwt"
	repoPostgres "github.com/samSRaina/kizen/api/internal/repository/postgres"
	transportHTTP "github.com/samSRaina/kizen/api/internal/transport/http"
	"github.com/samSRaina/kizen/api/internal/transport/http/handler"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	dbURL := os.Getenv("DATABASE_URL")
	pool, err := repoPostgres.NewPool(ctx, dbURL)
	if err != nil {
		logger.Error("failed to connect to database", slog.Any("error", err))
		os.Exit(1)
	}
	defer pool.Close()
	logger.Info("connected to database successfully")

	// Repositories
	wsRepo := repoPostgres.NewRepository(pool)
	ticketRepo := repoPostgres.NewTicketRepository(pool)
	timeEntryRepo := repoPostgres.NewTimeEntryRepository(pool)

	wsService := appWorkspace.NewService(wsRepo, logger)
	ticketService := appTicket.NewService(ticketRepo, logger)
	timeEntryService := appTimeEntry.NewService(timeEntryRepo, logger)

	wsHandler := handler.NewWorkspaceHandler(wsService)
	ticketHandler := handler.NewTicketHandler(ticketService)
	timeEntryHandler := handler.NewTimeEntryHandler(timeEntryService)
	server := handler.NewServer(wsHandler, ticketHandler, timeEntryHandler)

	// Auth
	jwksURL := os.Getenv("AUTH_JWKS_URL")
	authProvider, err := jwt.NewAuthenticator(ctx, jwksURL)
	if err != nil {
		logger.Error("failed to initialize auth provider", slog.Any("error", err), slog.String("jwks_url", jwksURL))
		os.Exit(1)
	}
	var _ ports.Authenticator = authProvider

	router := transportHTTP.NewRouter(transportHTTP.RouterConfig{
		Authenticator: authProvider,
		Server:        server,
	})

	port := os.Getenv("PORT")
	httpServer := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	go func() {
		logger.Info(fmt.Sprintf("kizen api server listening on :%s", port))
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("server encountered an error", slog.Any("error", err))
			os.Exit(1)
		}
	}()

	<-shutdown
	logger.Info("shutting down gracefully...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		logger.Error("server forced to shutdown", slog.Any("error", err))
		os.Exit(1)
	}
	logger.Info("server exited cleanly")
}
