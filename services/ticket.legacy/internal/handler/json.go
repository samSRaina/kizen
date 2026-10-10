package handler

import (
	"encoding/json"
	"net/http"
)

func writeJSONError(w http.ResponseWriter, status int, response any) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	return json.NewEncoder(w).Encode(response)
}
