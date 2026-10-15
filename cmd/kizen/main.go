package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/samSRaina/kizen/internal/domain/auth"
	"github.com/samSRaina/kizen/internal/handler"
	repository "github.com/samSRaina/kizen/internal/repository/postgres"
	"github.com/samSRaina/kizen/internal/service"
	"github.com/samSRaina/kizen/internal/transport/http/middleware"
	transportHTTP "github.com/samSRaina/kizen/internal/transport/http/router"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 1. Database Connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/kizen?sslmode=disable"
	}

	poolConfig, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		log.Fatalf("Unable to parse database config: %v\n", err)
	}

	dbPool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer dbPool.Close()

	if err := dbPool.Ping(ctx); err != nil {
		log.Printf("Warning: Database ping failed: %v (running with limited DB connectivity)\n", err)
	} else {
		log.Println("Connected to PostgreSQL database successfully.")
	}

	// 2. Dependency Injection
	wsRepo := repository.NewWorkspaceRepository(dbPool)
	wsService := service.NewWorkspaceService(wsRepo)
	wsHandler := handler.NewWorkspaceHandler(wsService)

	// Auth components: Bearer Extractor + Dev Authenticator (allows "Bearer dev-token")
	extractor := middleware.NewBearerExtractor()
	authenticator := auth.NewDevAuthenticator()

	// 3. Assemble Chi Router
	router := transportHTTP.NewRouter(transportHTTP.RouterConfig{
		Extractor:     extractor,
		Authenticator: authenticator,
		WSHandler:     wsHandler,
	})

	// 4. HTTP Server with Graceful Shutdown
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Server shutdown listener goroutine
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("Kizen API server listening on http://localhost:%s\n", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v\n", err)
		}
	}()

	<-shutdownChan
	log.Println("Shutting down server")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v\n", err)
	}

	log.Println("Server exited successfully.")
}
