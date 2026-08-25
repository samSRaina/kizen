package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

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
		return err
	}

	inMemRepo := repository.NewInMemRepo()
	repo := repository.NewTicketRepository(pool)
	serv := service.NewService(inMemRepo)
	ticketHandler := handler.NewTicketHandler(serv)

	router := chi.NewRouter()
	router.Post("/tickets", ticketHandler.Create)

	fmt.Println("server started on: " + cfg.ServerPort)
	log.Fatal(http.ListenAndServe(":"+cfg.ServerPort, router))

}
