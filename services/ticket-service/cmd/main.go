package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/samSRaina/kizen/services/ticket-service/internal/handler"
	"github.com/samSRaina/kizen/services/ticket-service/internal/infrastructure/repository"
	"github.com/samSRaina/kizen/services/ticket-service/internal/service"
)

func main() {
	repo := repository.NewInMemRepo()
	serv := service.NewService(repo)
	handler := handler.NewTicketHandler(serv)
	router := chi.NewRouter()
	router.Post("/tickets", handler.Create)
	fmt.Println("server started")
	log.Fatal(http.ListenAndServe(":8080", router))

}
