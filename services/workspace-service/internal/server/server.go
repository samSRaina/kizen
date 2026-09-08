// Package server wires the HTTP transport: generated OpenAPI routes
// mounted under /api/v1, plus health endpoints.
package server

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/samSRaina/kizen/internal/database"
	"github.com/samSRaina/kizen/services/workspace-service/internal/api"
	"github.com/samSRaina/kizen/services/workspace-service/internal/service"
)

// Router builds the full HTTP handler for the workspace service.
func Router(logger *slog.Logger, queries *database.Queries, ready func(ctx context.Context) error) http.Handler {
	r := chi.NewRouter()

	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	r.Get("/readyz", func(w http.ResponseWriter, r *http.Request) {
		if err := ready(r.Context()); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	r.Route("/api/v1", func(r chi.Router) {
		api.HandlerFromMux(
			api.NewStrictHandlerWithOptions(service.NewService(queries), nil, api.StrictHTTPServerOptions{
				RequestErrorHandlerFunc:  problem(logger, http.StatusBadRequest),
				ResponseErrorHandlerFunc: problem(logger, http.StatusInternalServerError),
			}),
			r,
		)
	})

	return r
}

// problem writes an RFC 9457 problem+json body for handler/middleware
// failures that never reached a generated response type.
func problem(logger *slog.Logger, status int) func(http.ResponseWriter, *http.Request, error) {
	return func(w http.ResponseWriter, _ *http.Request, err error) {
		detail := err.Error()
		if status >= 500 {
			logger.Error("request failed", "error", err)
		} else {
			logger.Warn("request rejected", "error", err)
		}

		w.Header().Set("Content-Type", "application/problem+json")
		w.WriteHeader(status)

		_ = json.NewEncoder(w).Encode(api.ProblemDetail{
			Status: status,
			Title:  http.StatusText(status),
			Detail: &detail,
		})
	}
}
