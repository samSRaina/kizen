kizen/
├── api/openapi.yaml          # Single source of truth (OpenAPI contract)
├── cmd/kizen/main.go         # Composition root (bootstraps env, DB, wires layers)
├── internal/
│   ├── config/               # Environment variable loading
│   ├── domain/               # Pure data structures, business entities & value objects
│   │   ├── auth/             # Identity, UserID, TokenExtractor & Authenticator ports
│   │   ├── ticket/           # Ticket entity & inputs
│   │   └── workspace/        # Workspace entity & inputs
│   ├── service/              # Core business logic orchestrating repositories
│   ├── repository/           # Persistence layer (Postgres + SQLC queries)
│   ├── handler/              # HTTP controllers (receives req, calls service, sends response)
│   ├── transport/http/       # Chi router, routing groups, Auth middlewares
│   └── platform/             # Reusable infrastructure utilities
│       ├── httpx/            # JSON encoder & RFC 7807 ProblemDetail response helpers
│       └── logger/           # slog setup (or Chi logger integration)
├── sql/                      # Migrations & SQLC query definitions
└── web/                      # Frontend
