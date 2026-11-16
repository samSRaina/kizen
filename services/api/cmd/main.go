package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/api/internal/adapter/auth/jwt"
	repoPostgres "github.com/samSRaina/kizen/api/internal/adapter/repository/postgres"
	appProject "github.com/samSRaina/kizen/api/internal/application/project"
	appTicket "github.com/samSRaina/kizen/api/internal/application/ticket"
	appTrack "github.com/samSRaina/kizen/api/internal/application/track"
	appWorkspace "github.com/samSRaina/kizen/api/internal/application/workspace"
	transportHTTP "github.com/samSRaina/kizen/api/internal/transport/http"
	"github.com/samSRaina/kizen/api/internal/transport/http/handler"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/kizen?sslmode=disable"
	}

	poolConfig, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		logger.Error("failed to parse database url", slog.Any("error", err))
		os.Exit(1)
	}

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		logger.Error("failed to create connection pool", slog.Any("error", err))
		os.Exit(1)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		logger.Error("failed to ping postgresql database", slog.Any("error", err))
		os.Exit(1)
	}
	logger.Info("connected to postgresql successfully")

	wsRepo := repoPostgres.NewRepository(pool)
	projectRepo := repoPostgres.NewProjectRepository(pool)
	ticketRepo := repoPostgres.NewTicketRepository(pool)
	trackRepo := repoPostgres.NewTrackRepository(pool)

	wsService := appWorkspace.NewService(wsRepo, logger)
	projectService := appProject.NewService(projectRepo, logger)
	ticketService := appTicket.NewService(ticketRepo, logger)
	trackService := appTrack.NewService(trackRepo, logger)

	wsHandler := handler.NewWorkspaceHandler(wsService)
	projectHandler := handler.NewProjectHandler(projectService)
	ticketHandler := handler.NewTicketHandler(ticketService)
	trackHandler := handler.NewTrackHandler(trackService)
	server := handler.NewServer(wsHandler, projectHandler, ticketHandler, trackHandler)

	jwksURL := os.Getenv("AUTH_JWKS_URL")
	if jwksURL == "" {
		jwksURL = os.Getenv("AUTH_JKWS_URL")
	}
	if jwksURL == "" {
		jwksURL = "http://web:3000/api/auth/jwks"
	}

	authProvider, err := jwt.NewAuthenticator(ctx, jwksURL)
	if err != nil {
		logger.Error("failed to initialize auth provider", slog.Any("error", err), slog.String("jwks_url", jwksURL))
		os.Exit(1)
	}

	router := transportHTTP.NewRouter(transportHTTP.RouterConfig{
		Authenticator: authProvider,
		Server:        server,
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	httpServer := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logger.Info("starting HTTP server", slog.String("addr", httpServer.Addr))
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("server encountered fatal error", slog.Any("error", err))
			os.Exit(1)
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	logger.Info("shutdown signal received, draining active connections")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		logger.Error("server forced to shutdown", slog.Any("error", err))
		os.Exit(1)
	}

	logger.Info("server exited cleanly")
}
