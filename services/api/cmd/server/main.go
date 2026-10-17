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

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/api/internal/application/ports"
	appWorkspace "github.com/samSRaina/kizen/api/internal/application/workspace"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/infrastructure/auth/jwt"
	repoPostgres "github.com/samSRaina/kizen/api/internal/repository/postgres"
	transportHTTP "github.com/samSRaina/kizen/api/internal/transport/http"
	"github.com/samSRaina/kizen/api/internal/transport/http/handler"
)

// dbAuthenticator validates tokens against Better-Auth sessions in postgres with dev-token fallback
type dbAuthenticator struct {
	pool *pgxpool.Pool
}

func (d *dbAuthenticator) Authenticate(ctx context.Context, token string) (*auth.Identity, error) {
	if token == "dev-token" {
		return &auth.Identity{
			UserID: "usr_dev123",
			Email:  "developer@kizen.dev",
		}, nil
	}

	if d.pool != nil {
		var userID, email string
		query := `
			SELECT s."userId", COALESCE(u.email, '')
			FROM session s
			LEFT JOIN "user" u ON s."userId" = u.id
			WHERE s.token = $1 AND s."expiresAt" > NOW()
			LIMIT 1
		`
		err := d.pool.QueryRow(ctx, query, token).Scan(&userID, &email)
		if err == nil && userID != "" {
			return &auth.Identity{
				UserID: auth.UserID(userID),
				Email:  email,
			}, nil
		}
	}

	// Development fallback: if any non-empty token is present, resolve to dev identity
	if token != "" {
		return &auth.Identity{
			UserID: "usr_dev123",
			Email:  "developer@kizen.dev",
		}, nil
	}

	return nil, auth.ErrInvalidToken
}

func main() {
	// 1. Structured JSON Logger
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 2. Database Connection Pool with Functional Options
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/kizen?sslmode=disable"
	}

	pool, err := repoPostgres.NewPool(ctx, dbURL)
	if err != nil {
		logger.Error("failed to connect to database", slog.Any("error", err))
		os.Exit(1)
	}
	defer pool.Close()
	logger.Info("connected to postgresql successfully")

	// 3. Dependency Injection (Accept Interfaces, Return Structs)
	wsRepo := repoPostgres.NewRepository(pool)
	wsService := appWorkspace.NewService(wsRepo, logger)
	httpHandler := handler.NewHandler(wsService)
	// authProvider := &dbAuthenticator{pool: pool}

	jwksURL := os.Getenv("AUTH_JKWS_URL")
	authProvider, err := jwt.NewAuthenticator(ctx, jwksURL)

	var _ ports.Authenticator = authProvider

	// 4. Assemble Chi Router with Strict OpenAPI Handler
	router := transportHTTP.NewRouter(transportHTTP.RouterConfig{
		Authenticator: authProvider,
		Handler:       httpHandler,
	})

	// 5. HTTP Server Configuration
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// 6. Graceful Shutdown Listener
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		logger.Info(fmt.Sprintf("kizen api server listening on :%s", port))
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("http server failed", slog.Any("error", err))
			os.Exit(1)
		}
	}()

	<-shutdownChan
	logger.Info("shutting down server gracefully...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		logger.Error("server forced to shutdown", slog.Any("error", err))
		os.Exit(1)
	}

	logger.Info("server exited cleanly")
}
