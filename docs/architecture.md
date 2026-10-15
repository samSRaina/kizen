# Standard Go Hexagonal Architecture Blueprint

This document sets the definitive architecture for Kizen across **`services/api`**, **`services/web`**, and **`services/database`**, orchestrated locally with **Tilt** and routed through **Traefik**, adhering strictly to **Standard Go** conventions ([Go Design Patterns](file:///home/sam/git/kizen-dev/.agents/skills/golang-design-patterns/SKILL.md) & [Go Naming](file:///home/sam/git/kizen-dev/.agents/skills/golang-naming/SKILL.md)).

---

## 1. System Topology & Edge Routing (Traefik)

Traefik acts as the single edge reverse proxy on port `:80` (with dashboard on `:8080`), routing between autonomous services:

```
                            Client Browser / App
                                      |
                                      v
                      Traefik Reverse Proxy (:80)
                       (Dashboard on :8080)
                                      |
              +-----------------------+-----------------------+
              | PathPrefix(`/api`)                            | PathPrefix(`/`)
              v                                               v
     services/api (:8080)                            services/web (:3000)
    (Standard Go Hexagonal)                           (React / Vite SPA)
              |
              | Internal Docker Network (:5432)
              v
     services/database (:5432)
       (PostgreSQL 16+)
```

### Traefik Configuration Highlights
- **API Router**: Matches `PathPrefix(`/api`)` ➔ forwards directly to `api:8080`.
- **Web Router**: Matches `PathPrefix(`/`)` with default priority ➔ forwards to `web:3000`.
- **Database**: Unrouted; isolated to internal Docker network, exposed to host `localhost:5432` only for local DBA tools.

---

## 2. Standard Go Hexagonal Architecture (`services/api`)

The API service strictly maps Hexagonal Architecture to **Standard Go** conventions:

```
+---------------------------------------------------------------------------------------+
|                                    services/api                                       |
|                                                                                       |
|  [Driving Adapter]                                                                    |
|  internal/transport/http                                                              |
|  ├── handler/          --> Parses HTTP JSON, maps errors, writes responses            |
|  ├── middleware/       --> RequestID, Bearer token extraction, Auth context           |
|  └── router.go         --> Chi route tree mounting                                    |
|          |                                                                            |
|          v (calls)                                                                    |
|  [Inbound Port / Use Cases]                                                           |
|  internal/application                                                                 |
|  ├── ports/            --> Repository & Authenticator interfaces (consumed ports)     |
|  └── workspace/        --> *Service struct orchestrating business operations          |
|          |                                            ^                               |
|          v (uses)                                     | (implements)                  |
|  [Domain Core]                                [Driven Adapter]                        |
|  internal/domain                              internal/repository                     |
|  ├── auth/             --> Value objects      └── postgres/                           |
|  │   ├── identity.go       (UserID, Identity)     ├── gen/         --> SQLC generated |
|  │   └── errors.go     --> Domain errors          ├── pool.go      --> pgxpool options|
|  └── workspace/        --> Entities & rules       └── workspace.go --> implements port|
|      ├── types.go                                                                     |
|      └── errors.go                                                                    |
+---------------------------------------------------------------------------------------+
```

---

## 3. Standard Go Implementation Rules Across All Layers

### 1. Package Naming & Organization
- **Single-word, lowercase names**: `workspace`, `auth`, `postgres`, `httpx`, `handler`.
- **No stuttering at call sites**:
  - `workspace.NewService(...)` (not `workspace.NewWorkspaceService()`)
  - `postgres.NewRepository(...)` (not `postgres.NewPostgresRepository()`)
  - `postgres.NewPool(...)` (not `postgres.NewPostgresPool()`)
  - `http.NewRouter(...)` (not `http.NewHTTPRouter()`)

### 2. Constructor & Interface Idiom: "Accept Interfaces, Return Structs"
- Constructors return concrete struct pointers (`*Service`, `*Repository`), never unexported types behind interfaces:
  ```go
  // services/api/internal/application/workspace/service.go
  type Service struct {
      repo ports.WorkspaceRepository
      log  *slog.Logger
  }

  func NewService(repo ports.WorkspaceRepository, log *slog.Logger) *Service {
      return &Service{repo: repo, log: log}
  }
  ```
- **Compile-time interface verification** in all driven adapters:
  ```go
  // services/api/internal/repository/postgres/workspace.go
  var _ ports.WorkspaceRepository = (*Repository)(nil)
  ```

### 3. Pure Domain Layer (Zero I/O, Zero Frameworks)
- **Zero `net/http` in domain**: Token extraction from HTTP headers belongs exclusively in `transport/http/middleware`.
- **Strong Value Objects**:
  ```go
  // services/api/internal/domain/auth/identity.go
  type UserID string

  type Identity struct {
      UserID UserID
      Email  string
  }
  ```
- **Domain Sentinel Errors**: Lowercase error strings prefixed with the package name:
  ```go
  // services/api/internal/domain/workspace/errors.go
  var (
      ErrNotFound   = errors.New("workspace: not found")
      ErrInvalid    = errors.New("workspace: invalid input")
      ErrForbidden  = errors.New("workspace: access denied")
  )
  ```

### 4. Bounded Resources & Functional Options
- **Database Connection Pool (`internal/repository/postgres/pool.go`)**:
  - Configurable options: `WithMaxConns(n)`, `WithMinConns(n)`, `WithMaxConnIdleTime(d)`.
  - Default limits: `MaxConns = 25`, `MinConns = 5`, `MaxConnIdleTime = 15m`.
- **HTTP Server (`cmd/server/main.go`)**:
  - `ReadTimeout: 10s`, `WriteTimeout: 15s`, `IdleTimeout: 60s`.
  - Max body size bounded to 1MB via `http.MaxBytesReader` in `httpx`.
- **Error Handling**: Early return with flat happy paths, wrapping unexpected errors with `%w`.

### 5. Structured Logging & Graceful Shutdown
- Structured logging using the standard library `log/slog` (no third-party logger dependency).
- Context-aware logger injecting `request_id` and `user_id` into all logs.
- Signal interception (`SIGINT`, `SIGTERM`) with bounded 10s shutdown context.

---

## 4. Full Directory Tree

```
kizen/
├── Tiltfile                                 # 🎛️ Tilt configuration for all 3 services + Traefik
├── docker-compose.yaml                      # Local container topologies referenced by Tilt
│
├── deploy/
│   └── traefik/
│       ├── traefik.yaml                     # Static configuration (entrypoints :80, :8080)
│       └── dynamic.yaml                     # Dynamic route rules (/api -> api, / -> web)
│
├── contracts/
│   └── openapi/
│       └── api.yaml                         # OpenAPI 3.1 contract (Source of Truth)
│
└── services/
    │
    ├── api/                                 # 🚀 GO API SERVICE
    │   ├── go.mod                           # Standalone module: github.com/samSRaina/kizen/services/api
    │   ├── go.sum
    │   ├── sqlc.yaml                        # SQLC configuration scoped to API
    │   ├── Dockerfile                       # Container definition (dev with Air live-reload)
    │   ├── cmd/
    │   │   └── server/
    │   │       └── main.go                  # Composition root: wires DI & graceful shutdown
    │   └── internal/
    │       ├── domain/                      # LAYER 1: PURE DOMAIN CORE
    │       │   ├── auth/
    │       │   │   ├── identity.go          # UserID, Identity value objects
    │       │   │   └── errors.go            # Auth domain sentinel errors
    │       │   └── workspace/
    │       │       ├── types.go             # Workspace entity, WorkspaceID
    │       │       └── errors.go            # Workspace domain sentinel errors
    │       │
    │       ├── application/                 # LAYER 2: USE CASES & PORTS
    │       │   ├── ports/
    │       │   │   ├── repositories.go      # WorkspaceRepository port interface
    │       │   │   └── authenticator.go     # Authenticator port interface
    │       │   └── workspace/
    │       │       └── service.go           # Workspace use case (*Service struct)
    │       │
    │       ├── repository/                  # LAYER 3: DRIVEN ADAPTERS (Outbound)
    │       │   └── postgres/
    │       │       ├── gen/                 # Isolated SQLC-generated queries & models
    │       │       ├── pool.go              # pgxpool factory with Functional Options
    │       │       └── workspace.go         # Implements ports.WorkspaceRepository
    │       │
    │       ├── platform/                    # CROSS-CUTTING UTILITIES
    │       │   ├── config/                  # Environment loader with startup validation
    │       │   └── httpx/                   # RFC 7807 Problem Details & JSON codecs
    │       │
    │       └── transport/                   # LAYER 4: DRIVING ADAPTERS (Inbound)
    │           └── http/
    │               ├── handler/
    │               │   └── workspace.go     # Workspace HTTP handlers (decodes, calls UC, writes)
    │               ├── middleware/
    │               │   ├── extractor.go     # Bearer header parser
    │               │   ├── auth.go          # Auth enforcement & anonymous passthrough
    │               │   └── context.go       # Request-scoped Identity context accessors
    │               └── router.go            # Chi router assembly
    │
    ├── web/                                 # 🌐 FRONTEND SERVICE
    │   ├── package.json                     # Bun/Vite dependencies
    │   ├── Dockerfile                       # Dev container with Vite HMR
    │   └── src/
    │       ├── api/                         # Auto-generated client SDK from contracts/openapi
    │       ├── components/                  # UI design system components
    │       ├── features/                    # Workspace & Ticket feature modules
    │       └── routes/                      # Route tree
    │
    └── database/                            # 🗄️ DATABASE SERVICE
        ├── Dockerfile
        ├── migrations/                      # Plain SQL migrations (000001_*.up.sql, *.down.sql)
        ├── queries/                         # SQL query files compiled by SQLC
        └── seeds/                           # Development test fixtures
```

---

## 5. Tilt Local Development Orchestration (`Tiltfile`)

Tilt coordinates all services inside the container network with live-reload:

```
Tiltfile Configuration
├── Traefik (:80, :8080)
│   └── Routes incoming traffic to API and Web
│
├── Database (PostgreSQL :5432)
│   ├── Starts Postgres container
│   ├── Runs readiness probe (pg_isready)
│   └── Executes migrations from services/database/migrations
│
├── API (Go backend :8080)
│   ├── Watches: services/api/**/*.go, services/api/sqlc.yaml
│   ├── Live-reload via Air inside the container
│   └── Depends on: Database readiness
│
└── Web (Vite frontend :3000)
    ├── Watches: services/web/src/**, contracts/openapi/api.yaml
    └── Instant HMR through Traefik
```

---

## 6. Standard Go Quality & Naming Checklist

When we execute this plan, every Go file will verify against this checklist:

- [x] **No package stutter**: `workspace.NewService()`, `postgres.NewRepository()`.
- [x] **Accept interfaces, return structs**: All constructors return `*Type`.
- [x] **Compile-time interface checks**: `var _ ports.WorkspaceRepository = (*Repository)(nil)`.
- [x] **Pure domain**: Zero `net/http`, `database/sql`, or SQLC imports in `internal/domain`.
- [x] **Error strings**: Lowercase without punctuation, prefixed with package name (`"workspace: not found"`).
- [x] **Functional options**: For extensible constructors (`WithMaxConns`, `WithTimeout`).
- [x] **Standard logging**: Standard library `log/slog` throughout, contextualized with request/actor IDs.
- [x] **Zero `init()` and global state**: All dependencies explicitly wired in `cmd/server/main.go`.

go build -tags='no_clickhouse no_libsql no_mssql no_mysql no_sqlite3 no_vertica no_ydb' -o goose ./cmd/goose

# Available build tags:
#   no_azuresql    no_clickhouse  no_libsql   no_mssql
#   no_mysql       no_postgres    no_sqlite3  no_vertica
#   no_ydb
#
# Note: no_mssql also excludes the azuresql driver.
