# Kizen

A Jira-style issue tracker built as a **hybrid system**: a Go backend with strictly-bounded modules,
one monolithic PostgreSQL database, and a React SPA — sized for semi-production on a single host.

<!--> A full engineering audit of this codebase, including every defect found (with file/line evidence),
> the reasoning behind the architecture below, and a phased remediation roadmap, lives in
> **[analysis.md](./analysis.md)**. Read that before contributing.-->

## Stack

| Layer | Technology |
|---|---|
| Backend | Go (chi, pgx v5, sqlc, log/slog) |
| Database | PostgreSQL 17 (single shared schema, tool-managed migrations) |
| Frontend | React 19 + TypeScript + Vite (React Compiler), plain CSS |
| Edge / Dev | Traefik v3, Docker Compose, Tilt |

## Architecture (target)

```
browser ─▶ Traefik ─┬─ /api/*  ─▶ kizen app (single Go binary, chi router)
                    └─ /*     ─▶ nginx (static SPA bundle)
                                   │
                    ┌──────────────┴──────────────┐
                    │  internal/modules/          │
                    │   identity  projects  tickets│
                    │   (domain→service→repo→sqlc) │
                    └──────────────┬──────────────┘
                                   ▼
                        PostgreSQL (one schema,
                        RLS-scoped, one migration chain)
```

- **Modular monolith, monolithic database.** One deployable, one Postgres, modules with enforced
  boundaries (`platform ← modules`; `transport → service → domain`). No module touches another module's
  repository or tables. Extraction into separate services remains possible later by following the
  criteria in `analysis.md` §9.7 — it is deliberately *not* the starting position.
- **Contract-first API.** `api/openapi.yaml` is the source of truth; server DTOs and TS client types are
  generated from it. Errors are RFC 7807 `application/problem+json`.
- **Server-owned identifiers.** Issue keys (`NW-143`) are allocated atomically per project in the
  database; clients never invent them.

## Repository layout

```
cmd/kizen/            deployable entrypoint (module wiring, HTTP server)
internal/
  platform/           shared kernel: config, postgres pool, httpx (respond/middleware), logger
  modules/
    identity/         users, orgs, memberships, sessions, auth
    projects/         projects, project members, workflow states
    tickets/          tickets, comments, labels, activity events
  app/                router registry / DI composition
sql/
  migrations/         ordered, tool-managed (goose) up/down chain — single source of schema
  seed/                development seed data (org, project NW, users)
api/openapi.yaml      API contract
web/                  React SPA
infra/docker/         Dockerfiles, nginx.conf
scripts/              generators (module scaffolding)
```

## Getting started

### Prerequisites

- Docker + Docker Compose
- (optional, for live reload) [Tilt](https://tilt.dev)

### Run

```bash
cp .env.example .env          # then edit values — never commit .env
docker compose up -d --wait   # starts Postgres, runs migrations, builds/serves web + backend
# app:      http://localhost
# api:      http://localhost/api/healthz
```

The first `up` applies all migrations to a fresh volume and seeds a dev org/project
(`key: NW`), two users, and a small set of workflow states and tickets.

### Development loop

```bash
# backend (tests run against a throwaway Postgres via testcontainers)
go test ./...
sqlc generate                # after editing sql/queries

# frontend
cd web && npm ci && npm run dev   # Vite on :5173, proxies /api to :80

# full local platform with live rebuild
tilt up
```

### Configuration

All runtime configuration is environment variables, validated at boot (the app exits with a precise
message if anything required is missing — see `.env.example` for the authoritative list):

| Variable | Default | Description |
|---|---|---|
| `SERVER_PORT` | `8080` | HTTP listen port for the app |
| `DATABASE_URL` | — (required) | Postgres connection string |
| `LOG_LEVEL` | `info` | `debug` \| `info` \| `warn` \| `error` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | — (dev only) | Initial database credentials |

## API (summary)

Base path `/api`, JSON only, errors as `application/problem+json` (RFC 7807).

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` / `logout` | Session cookie auth |
| `GET` | `/api/me` | Current user |
| `GET` | `/api/orgs/{orgID}/projects` | List projects |
| `GET` | `/api/projects/{projectID}/workflow` | Workflow states for the board |
| `GET` | `/api/projects/{projectID}/tickets` | List tickets (keyset-paginated, filterable) |
| `POST` | `/api/projects/{projectID}/tickets` | Create ticket (server assigns identifier) |
| `GET`/`PATCH`/`DELETE` | `/api/projects/{projectID}/tickets/{identifier}` | Read / update (move, assign, transition) / delete |
| `GET` | `/api/healthz`, `/api/readyz` | Liveness / readiness |

Full schema with request/response bodies: `api/openapi.yaml`.

## Operations

- **Health:** `/api/healthz` (liveness), `/api/readyz` (DB ping) — wired into Compose and Traefik.
- **Logs:** JSON to stdout (`slog`) with request ids; ship anywhere (Loki, CloudWatch, a file).
- **Backups:** nightly `pg_dump` volume job is included in the Compose dev setup; semi-production
  deployments are expected to restore-test it.
- **Scaling:** the app binary is stateless — `docker compose up -d --scale kizen=3` and put PgBouncer in
  front of Postgres when connection counts demand it.

## Roadmap status

This project is mid-remediation; the audit and the phase-by-phase plan (Phase 0 "make it work" →
Phase 4 "forward motion") are tracked in [analysis.md](./analysis.md) §10.

## Contributing

1. Read the house rules in `analysis.md` §9.3 (module boundaries, migration discipline).
2. Branch from `main`, keep commits Conventional-Commits style (`feat:`, `fix:`, `refactor:`).
3. CI must be green: `go vet` + `staticcheck` + `go test ./...` (unit **and** integration), migration
   apply on a fresh Postgres, `tsc -b` + `eslint` + `vitest`, image builds, and a Compose smoke test.
4. Schema changes = new migration files in `sql/migrations/`, never edits to applied migrations.

## License

MIT — see [LICENSE](./LICENSE).
