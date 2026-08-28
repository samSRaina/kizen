package main

import (
	"context"
	"log"
	"log/slog"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/samSRaina/kizen/services/ticket-service/internal/config"
	"github.com/samSRaina/kizen/services/ticket-service/internal/handler"
	"github.com/samSRaina/kizen/services/ticket-service/internal/infrastructure/database"
	"github.com/samSRaina/kizen/services/ticket-service/internal/infrastructure/repository"
	"github.com/samSRaina/kizen/services/ticket-service/internal/service"
)

func main() {
	ctx := context.Background()
	cfg := config.Load()

	pool, err := database.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("failed to ping database: %v", err)
	}

	repo := repository.NewTicketRepository(pool)
	serv := service.NewService(repo)

	logger := slog.New(
		slog.NewJSONHandler(os.Stdout, nil),
	)

	ticketHandler := handler.NewTicketHandler(serv, logger)

	router := chi.NewRouter()
	router.Post("/api/tickets", ticketHandler.Create)

	log.Printf("ticket-service listening on :%s", cfg.ServerPort)

	log.Fatal(http.ListenAndServe(":"+cfg.ServerPort, router))

}
