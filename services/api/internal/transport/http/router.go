package http

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/transport/http/gen"
	"github.com/samSRaina/kizen/api/internal/transport/http/httpx"
	"github.com/samSRaina/kizen/api/internal/transport/http/middleware"
)

type RouterConfig struct {
	Authenticator auth.Authenticator
	Server        gen.StrictServerInterface
}

func NewRouter(cfg RouterConfig) *chi.Mux {
	r := chi.NewRouter()

	// 1. Standard Middlewares
	r.Use(middleware.CorsMiddleware)
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.Recoverer)

	// 2. Public / Health endpoints
	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		httpx.JSON(w, http.StatusOK, map[string]string{
			"status": "healthy",
		})
	})

	// 3. Authenticated API Sub-router
	strictHandler := gen.NewStrictHandler(cfg.Server, nil)

	r.Route("/api/v1", func(api chi.Router) {
		api.Use(middleware.Authenticate(cfg.Authenticator))
		gen.HandlerFromMux(strictHandler, api)
	})

	return r
}
