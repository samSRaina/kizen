package httpx

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/samSRaina/kizen/internal/api"
)

// JSON serializes the given data structure to JSON and writes it to the response.
func JSON(w http.ResponseWriter, statusCode int, data any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(statusCode)
	if data != nil {
		_ = json.NewEncoder(w).Encode(data)
	}
}

// DecodeJSON safely decodes an incoming JSON request body into the target pointer.
// It enforces a maximum read limit to prevent denial-of-service via huge payloads.
func DecodeJSON(r *http.Request, target any) error {
	if r.Body == nil {
		return errors.New("request body cannot be empty")
	}
	defer r.Body.Close()

	// Limit request body to 1MB
	maxBytesReader := http.MaxBytesReader(nil, r.Body, 1048576)
	decoder := json.NewDecoder(maxBytesReader)
	decoder.DisallowUnknownFields() // Reject unexpected JSON fields

	if err := decoder.Decode(target); err != nil {
		return fmt.Errorf("malformed JSON body: %w", err)
	}

	// Ensure there is no trailing junk after the JSON payload
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		return errors.New("request body must contain only a single JSON object")
	}

	return nil
}

// Problem writes an RFC 7807 Problem Details JSON response adhering to api.ProblemDetail.
func Problem(w http.ResponseWriter, statusCode int, title, detail string) {
	problem := api.ProblemDetail{
		Status: statusCode,
		Title:  title,
		Detail: &detail,
	}

	w.Header().Set("Content-Type", "application/problem+json; charset=utf-8")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(problem)
}

// BadRequest writes a 400 Bad Request Problem response.
func BadRequest(w http.ResponseWriter, detail string) {
	Problem(w, http.StatusBadRequest, "Bad Request", detail)
}

// Unauthorized writes a 401 Unauthorized Problem response.
func Unauthorized(w http.ResponseWriter, detail string) {
	Problem(w, http.StatusUnauthorized, "Unauthorized", detail)
}

// Forbidden writes a 403 Forbidden Problem response.
func Forbidden(w http.ResponseWriter, detail string) {
	Problem(w, http.StatusForbidden, "Forbidden", detail)
}

// NotFound writes a 404 Not Found Problem response.
func NotFound(w http.ResponseWriter, detail string) {
	Problem(w, http.StatusNotFound, "Not Found", detail)
}

// InternalServerError writes a 500 Internal Server Error Problem response.
func InternalServerError(w http.ResponseWriter, detail string) {
	Problem(w, http.StatusInternalServerError, "Internal Server Error", detail)
}
