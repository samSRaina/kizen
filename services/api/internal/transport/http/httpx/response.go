package httpx

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
)

// ProblemDetail represents an RFC 7807 Problem Details object.
type ProblemDetail struct {
	Type   string `json:"type,omitempty"`
	Title  string `json:"title"`
	Status int    `json:"status"`
	Detail string `json:"detail,omitempty"`
}

// JSON serializes data and writes a 2xx/3xx HTTP response.
func JSON(w http.ResponseWriter, statusCode int, data any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(statusCode)
	if data != nil {
		_ = json.NewEncoder(w).Encode(data)
	}
}

// DecodeJSON safely reads and decodes the request body up to 1MB.
func DecodeJSON(r *http.Request, target any) error {
	if r.Body == nil {
		return errors.New("request body cannot be empty")
	}
	defer r.Body.Close()

	maxBytesReader := http.MaxBytesReader(nil, r.Body, 1048576) // 1MB cap
	decoder := json.NewDecoder(maxBytesReader)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(target); err != nil {
		return fmt.Errorf("malformed json body: %w", err)
	}

	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		return errors.New("request body must contain only a single json object")
	}

	return nil
}

// Problem writes an RFC 7807 Problem Details response.
func Problem(w http.ResponseWriter, statusCode int, title, detail string) {
	problem := ProblemDetail{
		Status: statusCode,
		Title:  title,
		Detail: detail,
	}
	w.Header().Set("Content-Type", "application/problem+json; charset=utf-8")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(problem)
}

func BadRequest(w http.ResponseWriter, detail string) {
	Problem(w, http.StatusBadRequest, "Bad Request", detail)
}

func Unauthorized(w http.ResponseWriter, detail string) {
	Problem(w, http.StatusUnauthorized, "Unauthorized", detail)
}

func NotFound(w http.ResponseWriter, detail string) {
	Problem(w, http.StatusNotFound, "Not Found", detail)
}

func Conflict(w http.ResponseWriter, detail string) {
	Problem(w, http.StatusConflict, "Conflict", detail)
}

func InternalServerError(w http.ResponseWriter, detail string) {
	Problem(w, http.StatusInternalServerError, "Internal Server Error", detail)
}
