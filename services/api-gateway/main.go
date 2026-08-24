package main

import (
	"log"
	"net/http"
)

func main() {
	log.Println("Starting API gateway")

	mux := http.NewServeMux()
	mux.HandleFunc("/api/ticket", handleTicket)

	server := &http.Server{
		Addr:    ":8081",
		Handler: mux,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Printf("http server error : %v", err)
	}
}
