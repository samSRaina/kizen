package main

import (
	"encoding/json"
	"net/http"

	"github.com/samSRaina/kizen/shared/contracts"
)

func handleTicket(w http.ResponseWriter, r *http.Request) {
	var reqBody TicketRequest
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, "failed to parse json data", http.StatusBadRequest)
		return
	}

	defer r.Body.Close()

	response := contracts.APIResponse{
		Data: "ok",
		Error: &contracts.APIError{
			Code:    http.StatusText(http.StatusCreated),
			Message: "server created",
		},
	}

	writeJSON(w, http.StatusCreated, response)
}
