package http

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	middleware "github.com/go-chi/chi/v5/middleware"

	"github.com/samSRaina/kizen/internal/domain/auth"
	"github.com/samSRaina/kizen/internal/handler"
	"github.com/samSRaina/kizen/internal/platform/httpx"
	customMiddleware "github.com/samSRaina/kizen/internal/transport/http/middleware"
)

type RouterConfig struct {
	Extractor     auth.TokenExtractor
	Authenticator auth.Authenticator
	WSHandler     *handler.WorkspaceHandler
}

func NewRouter(cfg RouterConfig) *chi.Mux {
	r := chi.NewRouter()

	// 1. Built-in standard Chi middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// 2. Global Token Extraction & Context Populator (never blocks anonymous)
	r.Use(customMiddleware.Authenticate(cfg.Extractor, cfg.Authenticator))

	// 3. Public Healthcheck Endpoint
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// 4. Protected API v1 Routes
	r.Route("/api/v1", func(api chi.Router) {
		// Strict auth guard on all subroutes
		api.Use(customMiddleware.RequireAuth())

		api.Route("/workspaces", func(ws chi.Router) {
			ws.Get("/", cfg.WSHandler.List)
			ws.Post("/", cfg.WSHandler.Create)
			ws.Delete("/{id}", cfg.WSHandler.Delete)
		})
	})

	return r
}
