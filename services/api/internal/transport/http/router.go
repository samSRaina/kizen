package http

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/samSRaina/kizen/api/internal/application/ports"
	"github.com/samSRaina/kizen/api/internal/platform/httpx"
	"github.com/samSRaina/kizen/api/internal/transport/http/gen"
	"github.com/samSRaina/kizen/api/internal/transport/http/handler"
	"github.com/samSRaina/kizen/api/internal/transport/http/middleware"
)

type RouterConfig struct {
	Authenticator ports.Authenticator
	Handler       *handler.Handler
}

func NewRouter(cfg RouterConfig) *chi.Mux {
	r := chi.NewRouter()

	// 1. Standard Middlewares
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.Recoverer)

	// 2. Token Extraction & Auth Context Injector
	r.Use(middleware.Authenticate(cfg.Authenticator))

	// 3. Healthcheck Endpoint (Public)
	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// 4. Wrap the Strict Handler
	strictHandler := gen.NewStrictHandler(cfg.Handler, nil)

	// 5. Mount all routes generated from OpenAPI under /api/v1 onto base router r
	gen.HandlerWithOptions(strictHandler, gen.ChiServerOptions{
		BaseURL:    "/api/v1",
		BaseRouter: r,
		Middlewares: []gen.MiddlewareFunc{
			middleware.RequireAuth(),
		},
	})

	return r
}
