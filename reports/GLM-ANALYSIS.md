# Kizen — Full Engineering Audit & Architecture Blueprint

> **Scope:** every file in this repository was read and audited — Go services, SQL schema, sqlc config and
> generated code, infra (Compose / Tilt / Dockerfiles / nginx), the React frontend, git state, and CI posture.
> **Thesis of this document:** you are building a *hybrid* system — modular services, one monolithic Postgres —
> which is a sound goal. The problem is that the current implementation is neither a working monolith nor a
> working distributed system: it is a partially-wired microservice skeleton whose pieces do not connect
> end-to-end, sitting on a database that cannot even bootstrap from a fresh volume. This document catalogs
> every defect found (with file/line evidence), then lays out the architecture that actually gets you to a
> semi-production-grade hybrid on a single database.

---

## 0. How to read this document

| Severity | Meaning |
|---|---|
| **P0** | The system is broken or unsafe *right now*. Nothing works until these are fixed. |
| **P1** | Must be fixed before you can call this "semi-production". |
| **P2** | Structural/quality issues that compound as the codebase grows. Fix within the next iteration. |
| **P3** | Polish, process, and forward-looking improvements. |

Section 9 contains the target architecture (the hybrid you asked for), and section 10 is a phased roadmap
from where you are to that target.

---

## 1. Executive summary

**The single most important finding: the system does not work end-to-end today, and it fails at the very
first hop.** This is not one bug — it is a *chain* of independent defects across five layers that each
happen to be sufficient to break the whole flow on their own:

<!--FIXED AS OF: 6/09/2026 -->
<!--1. **The ticket-service listens on the wrong port.** `config.go` reads `TICKET_SERVER_PORT`, but Compose
   sets `SERVER_PORT`. The unset var means Go's `http.Server` gets `Addr: ""`, which defaults to **`:80`**.
   Traefik dials `ticket-service:8181`. Every API request returns **502 Bad Gateway**.-->

2. **The database cannot bootstrap.** Only `tickets.sql` is mounted into Postgres `initdb`, but it declares
   `project_id REFERENCES projects(id)` — and `projects` is never created. Even if you mounted all four
   migration files, there is *no valid ordering*: `projects.sql` references `organization(id)` but the table
   is (mis)created as `organizatons`; `projects.sql` references `users(id)` which sorts *after* it. A fresh
   `docker compose up` produces a Postgres that crash-loops on init.
3. **`DELETE` never deletes.** The sqlc query named `Delete` is a `SELECT` statement. Executing it deletes
   nothing and reports success.
4. **Routes don't match handlers.** `GET /api/tickets/{id}` is served by a handler that reads URL params
   `project_id` and `identifier` — which are never present. The handler also **fails to `return` after
   writing error responses**, so it double-writes headers and continues executing with a nil UUID.
5. **The frontend is a façade.** It renders 8 hardcoded seed tickets, never calls the (dead) `getTickets`
   helper, generates issue identifiers client-side from a local counter starting at 143, and POSTs
   hardcoded fake project UUIDs that cannot exist in the database.

Everything else in this document — security, schema design, testing, CI, observability — is layered on top
of the fact that the plumbing itself has to be made correct first.

**The good news:** the underlying instincts are right. sqlc, dependency-injected repositories, sentinel
errors with `errors.Is/As`, `slog` JSON logging, graceful shutdown, Traefik path-based routing, a typed API
client with `AbortController` timeouts — these are all correct *choices*. The blueprint in §9 keeps every
one of them and reorganizes the system around them.

---

## 2. Critical defects (P0) — the system is broken

<!--FIXED AS OF: 6/09/2026 -->
<!--### K-1. Environment variable mismatch → ticket-service listens on `:80`, Traefik dials `8181`

**Evidence**

- `services/ticket-service/internal/config/config.go:14` — `ServerPort: os.Getenv("TICKET_SERVER_PORT")`
- `docker-compose.yaml:62` — `SERVER_PORT: ${TICKET_SERVICE_PORT}` (which is `8181` from `.env`)
- `.env` — contains `TICKET_SERVICE_PORT=8181`; `TICKET_SERVER_PORT` appears **nowhere**
- `docker-compose.yaml:60` — Traefik label: `...loadbalancer.server.port=${TICKET_SERVICE_PORT}` → `8181`

**Impact.** `http.Server.Addr == ""` → `ListenAndServe` binds `:80` (Go's documented default for the
`http` port). The container runs fine as root; Traefik dials `ticket-service:8181` and gets connection
refused → **every `/api/tickets*` request through Traefik is a 502**, including the Vite dev proxy
(`web/vite.config.ts` targets `http://localhost:80`, which is Traefik). The frontend's create-issue toast
failure you would see in the UI is this bug, five layers down.

**Fix**

```go
// config.go
ServerPort: getEnv("SERVER_PORT", "8080"),
```

and standardize on ONE name (`SERVER_PORT`) across `.env`, `docker-compose.yaml`, and code. Better still,
don't hand-roll it — see §5.7 (envconfig with fail-fast validation; this exact class of bug is what a
validated config struct catches at boot).

Also configure the address correctly:

```go
addr := ":" + cfg.ServerPort // or net.JoinHostPort(cfg.Host, cfg.ServerPort)
server := &http.Server{Addr: addr, Handler: router, /* timeouts, see S-8 */}
```-->

### K-2. The database cannot bootstrap from a fresh volume — broken `initdb` + unorderable migrations

**Evidence**

- `docker-compose.yaml:42` — only `./sql/migrations/tickets.sql` is mounted as `001_tickets.sql`
- `sql/migrations/tickets.sql:17` — `project_id UUID NOT NULL REFERENCES projects(id)` (projects absent)
- `sql/migrations/organizations.sql:1` — `CREATE TABLE organizatons(` — **typo: the table is misspelled**
- `sql/migrations/projects.sql:3` — references `organization(id)` — which never exists because the table
  is named `organizatons`
- `sql/migrations/projects.sql:8` — references `users(id)`, but `users.sql` sorts *after* `projects.sql`
  alphabetically, so even in the best case the FK target doesn't exist yet
- `sql/migrations/tickets.sql:26-29` — the `created_by`/`assignee` FKs to `users` are commented out
  (probably *because* of the ordering problem — treating the symptom, not the cause)

**Impact.** On a fresh volume: Postgres init script #001 fails, the entrypoint aborts, and
`restart: unless-stopped` puts the container in a crash loop; `ticket-service` waits forever on
`service_healthy`. If it weren't for the port bug (K-1), the service would then fail every insert with FK
violations. If you currently have a *working* local DB, it's only because of a stale named volume from an
earlier iteration — the repo is not reproducible.

**Fix — three parts:**

1. **Adopt a real migration tool.** `initdb.d` scripts are for *seeding*, not schema management. Use
   [goose](https://github.com/pressly/goose) or [golang-migrate](https://github.com/golang-migrate/migrate)
   with versioned, ordered, up/down migrations:

   ```
   sql/migrations/
     0001_users.up.sql            0001_users.down.sql
     0002_organizations.up.sql    0002_organizations.down.sql
     0003_org_members.up.sql      0003_org_members.down.sql
     0004_projects.up.sql         0004_projects.down.sql
     0005_project_members.up.sql  0005_project_members.down.sql
     0006_tickets.up.sql          0006_tickets.down.sql
   ```

   Ordered explicitly, each migration only assuming the state produced by its predecessors.

2. **Run migrations as a one-shot service** (or embed via `go:embed` and run at binary startup under an
   advisory lock):

   ```yaml
   migrate:
     image: migrate/migrate
     volumes: ["./sql/migrations:/migrations:ro"]
     command: ["-path", "/migrations", "-database",
               "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@database:5432/${POSTGRES_DB}?sslmode=disable",
               "up"]
     depends_on: { database: { condition: service_healthy } }
     restart: on-failure
   ticket-service:
     depends_on:
       database:  { condition: service_healthy }
       migrate:   { condition: service_completed_successfully }
   ```

3. **Fix the schema defects while you're in there** (see §4.2): the `organizatons` typo, `UpdatedAt`
   vs `updated_at` inconsistency, `created_at` missing `NOT NULL` on organizations, `users.email` not
   `UNIQUE`.

**Rule going forward:** CI must always apply migrations to a *fresh* Postgres. That single check would
have caught K-2, the typo, and the ordering problem (§7.6).

### K-3. The `Delete` query is a `SELECT` — deletion is a no-op that reports success

**Evidence**

- `sql/queries/tickets.sql:14-16`:
  ```sql
  -- name: Delete :exec
  SELECT * FROM tickets
  WHERE project_id = $1
  AND identifier = $2;
  ```
- Generated code confirms it: `internal/database/tickets.sql.go:61-65` — `q.db.Exec(ctx, delete, ...)`
  executes a SELECT and discards the rows.

**Impact.** `DELETE /api/projects/{id}/tickets/{id}` returns **204 No Content and deletes nothing**.
Additionally, because `Exec` on zero matched rows is *not* `pgx.ErrNoRows`, the `ErrTicketNotFound`
mapping in `postgres.go:109-114` is dead code — deleting a nonexistent ticket also returns 204.

**Fix**

```sql
-- name: DeleteTicket :execrows
DELETE FROM tickets
WHERE project_id = $1 AND identifier = $2;
```

`:execrows` returns `(int64, error)` so the repository can map `rows == 0` → `domain.ErrTicketNotFound`.
Also rename it from `Delete` to `DeleteTicket` — `Delete` is a Go builtin name and a landmine in the
generated package.

### K-4. Route definitions don't match the URL params the handlers read

**Evidence**

- `services/ticket-service/cmd/main.go:58-60`:
  ```go
  router.Post("/api/tickets", ticketHandler.Create)
  router.Get("/api/tickets/{id}", ticketHandler.Get)
  router.Delete("/api/projects/{project_id}/tickets/{id}", ticketHandler.Delete)
  ```
- `handler.go:99` reads `chi.URLParam(r, "project_id")` in `Get` → the route defines `{id}`, not
  `{project_id}` → **always empty**
- `handler.go:104` reads `chi.URLParam(r, "identifier")` → **never defined on any route** → always empty
- `handler.go:141` reads `"identifier"` on Delete while the route declares `{id}` → always empty

**Impact.** `uuid.Parse("")` fails → 400 path taken; the handler then *continues* (see K-5) and calls
`GetByID(uuid.Nil, "")` → no row → **every GET returns 404** (after garbage; see K-5). Every DELETE passes
an empty identifier into the (broken) query. Neither endpoint has ever returned a ticket.

**Fix — make resource paths uniform and mirror them exactly in handlers:**

```go
router.Post(  "/api/projects/{projectID}/tickets",                        ticketHandler.Create)
router.Get(   "/api/projects/{projectID}/tickets",                        ticketHandler.List)
router.Get(   "/api/projects/{projectID}/tickets/{identifier}",            ticketHandler.Get)
router.Patch( "/api/projects/{projectID}/tickets/{identifier}",            ticketHandler.Update)
router.Delete("/api/projects/{projectID}/tickets/{identifier}",            ticketHandler.Delete)
```

```go
projectID, err := uuid.Parse(chi.URLParam(r, "projectID"))
if err != nil { respond.Error(w, r, http.StatusBadRequest, "invalid project id"); return }

identifier := chi.URLParam(r, "identifier")
if identifier == "" { respond.Error(w, r, http.StatusBadRequest, "invalid identifier"); return }
```

### K-5. Missing `return` after error responses — double-written headers and continued execution

**Evidence.** `handler.go:99-107` (Get) and `handler.go:136-143` (Delete):

```go
pID, err := uuid.Parse(chi.URLParam(r, "project_id"))
if err != nil {
    writeJSONError(w, http.StatusBadRequest, "invalid project id")
}            // <-- no return
id := chi.URLParam(r, "identifier")
if id == "" {
    writeJSONError(w, http.StatusBadRequest, "invalid ticket identifier")
}            // <-- no return
t, err := h.service.GetByID(r.Context(), pID, id)  // executes with uuid.Nil / ""
```

**Impact.** Go compiles this happily (`writeJSONError` returns an error nobody checks; `go vet` passes —
I verified). At runtime: `http: superfluous response.WriteHeader call` is logged, the second error body is
appended after the first, and then the service is invoked with garbage parameters. This pattern is why
several "not found" behaviors are actually "invalid input" behaviors in disguise.

**Fix.** Make the responder **unmissable** — a tiny `internal/httpx/respond` package where every helper
takes the writer and the handler *always* returns immediately, plus a lint rule. Concretely:

```go
func Error(w http.ResponseWriter, r *http.Request, status int, msg string) {
    w.Header().Set("Content-Type", "application/problem+json")
    w.WriteHeader(status)
    _ = json.NewEncoder(w).Encode(map[string]string{
        "type":   "about:blank",
        "title":  http.StatusText(status),
        "detail": msg,
        "instance": r.URL.Path,
    })
}
```

…and in CI add `errcheck` (it would flag ignored `writeJSONError` returns today) plus review discipline:
**a handler must never fall through after writing a response.** Even better, see §5.2: centralize the
error→status mapping so handlers have a single `respond` call and no `return`-shaped footguns.

### K-6. The error body contract doesn't match what the frontend parses

**Evidence**

- Server: `handler/json.go:8-12` encodes a **bare JSON string** — handlers pass `"invalid request"`,
  `"ticket not found"`, etc. A response body is literally `"invalid request"` (a JSON string, not an object).
- Client: `web/src/api/client.ts:37-41` reads `data?.error || data?.message` — `data` is a string, so both
  are `undefined`, and the UI falls back to `HTTP error 400: Bad Request`-style generic text.

**Impact.** None of your carefully-written server messages (`"ticket already exists"`, `"invalid request"`)
have ever been seen by a user. Validation feedback is impossible; error UX is generic.

**Fix.** Define the error envelope once and share it via the OpenAPI spec (§7.7): RFC 7807 `application/problem+json`
is the industry answer and is what the `respond.Error` above emits. Update `client.ts` to parse
`detail`/`title`, and keep the API-error class carrying the parsed problem document.

### K-7. `domain.Ticket` has no JSON tags — the API leaks Go field names and forced the frontend to write a dual-casing shim

**Evidence**

- `domain/ticket.go:9-27` — no `json:"..."` tags anywhere, so `json.NewEncoder` emits
  `{"ID":..., "ProjectID":..., "Identifier":...}` (PascalCase).
- The frontend had to accommodate it: `web/src/types/ticket.ts:30-55` declares `RawTicketResponse` with
  **both** `ID`/`id`, `ProjectID`/`project_id`, `Status`/`status`, … and `tickets.api.ts:4-33` implements
  `normalizeTicket` to try every casing combination.

**Impact.** The wire contract is an accident of Go's default marshaling. Any rename of a struct field is
a silent breaking API change. The frontend's normalizer is defensive code compensating for an undefined
contract — and `normalizeTicket` fabricates data on failure (`crypto.randomUUID()` for a missing id,
`'ISSUE-0'`, `'Untitled Issue'`, `'JD'` initials) which can mask real bugs.

**Fix.** Two layers:

1. **Serialize DTOs, not domain structs.** Add a `transport` (or `httpdto`) layer with explicit tags:

   ```go
   type ticketResponse struct {
       ID          uuid.UUID  `json:"id"`
       ProjectID   uuid.UUID  `json:"project_id"`
       Identifier  string     `json:"identifier"`
       Title       string     `json:"title"`
       Description string     `json:"description"`
       Status      string     `json:"status"`
       Priority    string     `json:"priority"`
       CreatedBy   uuid.UUID  `json:"created_by"`
       Assignee    *uuid.UUID `json:"assignee,omitempty"`
       DueDate     *time.Time `json:"due_date,omitempty"`
       CreatedAt   time.Time  `json:"created_at"`
       UpdatedAt   time.Time  `json:"updated_at"`
   }
   ```

   Domain types stay persistence-and-transport-agnostic; the handler maps `domain.Ticket` ↔ DTO. This is
   also where K-12 gets fixed, because the DTO keeps `Assignee`/`DueDate` while the domain struct already
   has them.

2. Once the contract is stable, **delete `RawTicketResponse` and `normalizeTicket` from the frontend
   entirely** and generate the TS types from OpenAPI (`openapi-typescript` + `openapi-fetch`). Your
   `openapi-integration` branch suggests you were already heading here — finish it.

### K-8. The frontend never loads server state — it is a static façade over seed data

**Evidence**

- `web/src/store/TicketsContext.tsx:49-170` — 160 lines of hardcoded `SEED_TICKETS` with fake data
  (`'nw-142'`, due dates like `'Fri'`/`'Today'`).
- `TicketsContext.tsx:219` — `useState<Ticket[]>(SEED_TICKETS)`: initial state is fake data.
- `tickets.api.ts:41-52` — `getTickets()` exists, is **never called** anywhere (verified by grep — the only
  callers are its own definition), and **swallows every error** returning `[]` with a comment admitting
  the backend has no list endpoint.
- No `useEffect`/data-fetching of any kind exists in the app; the only server interaction is `createTicket`.

**Impact.** The dashboard shows imaginary issues. A user who creates an issue sees it (client-side
prepend) until refresh, at which point it vanishes — the list is never re-fetched. Server outages are
invisible. There is no `GET /api/projects/{id}/tickets` list endpoint on the backend either, so even a
willing frontend has nothing to call.

**Fix.**

1. Backend: implement the list query (keyset pagination — §5.9):
   ```sql
   -- name: ListTicketsByProject :many
   SELECT * FROM tickets
   WHERE project_id = $1
     AND ($2::timestamptz IS NULL OR (created_at, id) < ($2, $3))
   ORDER BY created_at DESC, id DESC
   LIMIT $4;
   ```
2. Frontend: replace hand-rolled fetching with **TanStack Query** (or SWR). The Context then shrinks to
   *UI state only* (active tab, view mode, modal open). `useQuery(['tickets', projectId], ...)` gives you
   caching, background refetch, retry, and stale-while-revalidate; mutations invalidate the list. Delete
   `SEED_TICKETS` and replace with an empty state + skeleton loaders. Server seed data (§4.6) replaces the
   fake workspaces.

### K-9. Identifiers are generated client-side — collision by design

**Evidence**

- `TicketsContext.tsx:227` — `useState<number>(143)` and `:245-247` — `nextIdentifier = NW-${issueCounter}`;
- `:252` — `createIssue` uses `` input.identifier || `NW-${issueCounter}` ``.

**Impact.** Every browser session starts at 143. Two users (or two tabs) create `NW-143` → the DB unique
constraint `(project_id, identifier)` rejects the second → 409 "ticket already exists" for an identifier
the user never chose. The `NW-` prefix is also wrong for every project that isn't Northwind. Identifiers
are *server-owned domain data*; a Jira key (`PROJ-123`) must be allocated atomically by the system of
record.

**Fix — see §4.5 for the full pattern** (per-project counter row + `SELECT ... FOR UPDATE` or
`pg_advisory_xact_lock`, inside the same transaction as the insert). The client stops sending
`identifier` at all; the response returns the server-assigned one.

### K-10. The frontend POSTs project/user UUIDs that cannot exist in the database

**Evidence**

- `TicketsContext.tsx:14-47` — `WORKSPACES` with hardcoded ids like
  `00000000-0000-0000-0000-000000000001`; `DEFAULT_USER.id = ...0002`.
- `CreateIssueModal` sends `projectId` from these; `createIssue` defaults `createdBy` to `DEFAULT_USER.id`.

**Impact.** Assuming the DB even exists (K-2), `tickets.project_id` has an FK to `projects` — no row with
that UUID exists → `23503` foreign-key violation → your repo only maps `23505`, so it falls through to a
500 "internal server error" toast. This also previews the auth problem (§3): `created_by` is *client
supplied* today, which means identity is spoofable.

**Fix.** The frontend must fetch real `/api/projects` and `/api/me` after auth (§9). For development,
seed known-good data (§4.6) so the UI has a stable world to render — but *from the server*, not baked
into components.

### K-11. The ticket status model disagrees across three layers

**Evidence**

- Postgres enum (`tickets.sql:1-6`): `backlog | in_progress | in_review | done` (4 values)
- Go domain (`domain/ticket.go:41-44`): same 4 values
- TypeScript (`types/ticket.ts:3`): **5 values** including `'todo'`
- `TicketsContext.tsx:291` — `quickCreateIssue` sends `status: 'todo'`, a value that does not exist in Go
  or Postgres (silently coerced to `backlog` by the handler default, and `KanbanBoard` then maps
  `backlog || todo → backlog` column)

**Impact.** The UI's "Todo" state exists nowhere in the backend. Either a ticket can never truly be in
"todo", or every layer drifts further. This is the classic distributed-enum drift problem, and it will
happen again for every new status/priority/type you add.

**Fix.** **Define the workflow once, in the database**, as data (not even an enum — see §4.4, where
statuses become a per-project workflow table, which is what Jira actually does), expose it via
`GET /api/projects/{id}/workflow`, and have the frontend render *from that*. Never hardcode status unions
in TS; drive them from OpenAPI-generated types.

### K-12. `Assignee` and `DueDate` are silently dropped on every read

**Evidence**

- `postgres.go:60-61` and `:92-94` — the mapping back to `domain.Ticket` has the Assignee/DueDate lines
  **commented out** ("Havent added helpers for nullable postgresql values"), even though the sqlc model
  carries them (`models.go:132-133`).

**Impact.** Tickets are created/read without ever round-tripping assignee or due date — the fields exist
in domain, DTO, UI (`dueDate`, `assigneeInitials`) and DB, but the repository silently nulls them. The UI
compensates with fabrications (`assigneeInitials: assignee ? assignee.slice(0,2).toUpperCase() : 'JD'` —
`tickets.api.ts:28` derives "initials" **from a UUID**).

**Fix.** Centralize pgtype↔native conversion helpers in one file and use them everywhere:

```go
func pgUUID(u uuid.UUID) pgtype.UUID { return pgtype.UUID{Bytes: u, Valid: true} }
func uuidPtr(v pgtype.UUID) *uuid.UUID {
    if !v.Valid { return nil }
    id := uuid.UUID(v.Bytes)
    return &id
}
func timePtr(v pgtype.Timestamptz) *time.Time {
    if !v.Valid { return nil }
    t := v.Time
    return &t
}
```

Note: `sqlc.yaml`'s overrides (`db_type: UUID` / `TIMESTAMPZ`, uppercase) are **dead configuration** —
sqlc matches `uuid`/`timestamptz` lowercase, which is why the generated code still uses `pgtype.*`
despite the overrides (see §5.10).

---

## 3. Security audit

### S-1. (P0) There is no authentication or authorization — identity is a request-body field

`createTicketRequest` takes `created_by uuid.UUID` from the client (`handler.go:39`). Anyone can create
tickets as anyone. `user-service` is a single `domain/user.go` file (not even tracked in git) with a
`Password_hash` field and no main, no handlers, no repository. There are no sessions, no tokens, no
middleware, and the frontend hardcodes `DEFAULT_USER`.

**Fix (phase 1 of the roadmap):** cookie-based sessions (recommended for this hybrid — see §9.5):
`POST /api/auth/register|login|logout`, server-side session table (`id, user_id, expires_at, ...`),
`HttpOnly; Secure; SameSite=Lax` cookie, CSRF token for unsafe methods, `argon2id`
(`golang.org/x/crypto/argon2`) for hashing with per-user salt and tuned parameters, generic error
messages on login failure, rate limiting on auth endpoints. `created_by` must come from the session,
never the body.

### S-2. (P0→P1) `password_hash` is one `SELECT *` away from an API leak

`users.sql` selects-by-default in sqlc (`models.go:138-144` — `User.PasswordHash string` with
`emit_json_tags: true` already emits `password_hash` JSON). The moment someone writes a user endpoint
around `SELECT *`, hashes go on the wire. **Fix:** never project the hash — separate sqlc queries
(`-- name: GetUserPublic :one SELECT id, username, email, created_at FROM users WHERE id = $1`), keep the
hash-only query (`GetUserForAuth`) inside the identity module, and add a code-review rule: no
`SELECT *` on `users`.

### S-3. (P1) Traefik insecure dashboard exposed on `:8080`

`docker-compose.yaml:3-10`: `--api.insecure=true` with `8080` published. The dashboard shows every routed
backend and can be used to enumerate your topology. **Fix:** drop `--api.insecure` (in semi-prod you don't
need the dashboard at all; if you do, bind it to `127.0.0.1:8080:8080` or protect with basic auth).

### S-4. (P1) No TLS anywhere in the path

Browser → Traefik is plain HTTP; app → DB is `sslmode=disable`. For semi-production on a single host,
put TLS termination in Traefik (Let's Encrypt via the `certificatesresolvers` config) or run Caddy in
front. DB TLS matters the moment the DB leaves localhost (managed DB).

### S-5. (P1) Containers run as root, unpinned base images, no hardening

- `ticket-service.Dockerfile:1` — `FROM alpine` (floating tag; also the binary is `CGO_ENABLED=0`, so
  `FROM gcr.io/distroless/static` or `scratch` is strictly better — see §7.1). No `USER`, no
  `HEALTHCHECK`, no `ca-certificates`.
- `web.Dockerfile:16` — `nginx:alpine` floating, root, and no security headers (§7.3).
- Compose: no `read_only`, no `cap_drop`, no resource limits, Docker socket mounted into Traefik.

**Fix** is in §7.1/§7.2 (multi-stage, distroless, non-root USER, pinned digests, `read_only: true` +
`tmpfs` where possible, `cap_drop: [ALL]`, socket-proxy for Traefik if you keep Docker provider).

### S-6. (P1) No request-level defenses

No rate limiting, no body-size limit (`http.MaxBytesReader` — a 10 MB JSON body is currently accepted and
buffered), no security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `HSTS` at the proxy),
no login-throttling design. Add `middleware.Throttle`/`httprate` at the proxy or app layer, `MaxBytes`
at the JSON decode site, and headers at nginx/Traefik.

### S-7. (P2) `.env` holds real secrets posture

`.env` is correctly gitignored, but there is no `.env.example`, so the required variables are tribal
knowledge (and K-1 shows where that leads). Postgres creds are `postgres/postgres`. Add
`.env.example` (committed), generate dev-only values in a `make bootstrap`, and never reuse them outside
dev.

### S-8. (P2) `http.Server` has no timeouts → slowloris exposure

`cmd/main.go:63-66` sets only `Addr`/`Handler`. A slow client can hold a connection open indefinitely.
Standard hardening:

```go
server := &http.Server{
    Addr:              addr,
    Handler:           router,
    ReadHeaderTimeout: 5 * time.Second,
    ReadTimeout:       10 * time.Second,
    WriteTimeout:      15 * time.Second,
    IdleTimeout:       60 * time.Second,
    MaxHeaderBytes:    16 * 1024,
}
```

### S-9. (Positive note) SQL injection: not present

All DB access flows through sqlc-generated parameterized queries (`pgx` placeholders). Keep it that way;
never hand-concatenate SQL for "just this one dynamic filter" — use sqlc's `sqlc.narg()` / query-building
or a controlled `CASE`-based sort whitelist.

### S-10. (P2) Authorization model is absent by design

Even with auth, "who can see/edit which project's tickets" needs an answer. The schema already sketches it
in comments (`project_member`, `organization_member` with roles — `projects.sql:16-25`,
`organizations.sql:14-30`). §4.4 makes these real tables and §9.4 defines the enforcement point
(middleware → context → repository scoping, optionally RLS as defense-in-depth).

---

## 4. Database deep dive (the monolith DB, done right)

You explicitly want to keep the **monolithic database**. That's a legitimate architecture — but a shared
DB only stays sane with strict ownership rules: one migration chain, one schema owner per module,
tenant scoping enforced at the DB where possible, and no cross-module table reach-arounds in queries.

### 4.1 What's wrong with the current schema files

| File | Issue |
|---|---|
| `organizations.sql:1` | `organizatons` typo → all FKs to `organization` can never resolve |
| `organizations.sql:10` | `UpdatedAt` (PascalCase, inconsistent with `updated_at` everywhere else) |
| `organizations.sql:9` | `created_at` missing `NOT NULL` |
| `users.sql:5` | `email` is not `UNIQUE` (username is) — email must be unique for login-by-email |
| `projects.sql:9` | `archived bool NOT NULL` with no default — every insert must set it; add `DEFAULT false` |
| `projects.sql` | no `key`/slug column for the project-issue prefix (`NW-143` needs a `key`) |
| `tickets.sql:19` | `identifier TEXT` — fine, but must be server-generated (§4.5); consider `SMALLINT` sequence + derived display key |
| `tickets.sql` | no `position`/ordering column for kanban ordering; no `deleted_at`; no `version` for optimistic concurrency |
| all | no index on `tickets(status)` for board filtering; no full-text search on title/description (a Jira clone lives and dies by search) |
| all | comments-as-migrations (`-- TODO: PROJECT MEMBER MODEL`) — schema by commented-out SQL is how the ordering bug (K-2) happened |

### 4.2 Naming and hygiene rules to adopt

- `snake_case` columns, `plural` tables, `created_at`/`updated_at` `TIMESTAMPTZ NOT NULL DEFAULT now()`.
- Auto-maintain `updated_at` with a trigger — right now every future `UPDATE` must remember to set it,
  and forgetting is a silent data bug:

  ```sql
  CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
  BEGIN NEW.updated_at = now(); RETURN NEW; END $$ LANGUAGE plpgsql;

  CREATE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  ```

### 4.3 The domain model is far from a Jira clone

Current domain: users, organizations, projects, tickets — 4 tables, no membership, no comments, no
workflow, no sprints, no labels, no relations, no audit. The minimally credible Jira-clone core:

```sql
-- identity & tenancy
users(id PK, email UNIQUE, username UNIQUE, password_hash, display_name, created_at, updated_at)
organizations(id PK, name, slug UNIQUE, created_by → users, created_at, updated_at)
organization_members(org_id → organizations, user_id → users, role org_role, PK(org_id, user_id))

-- projects
projects(id PK, organization_id → organizations, key TEXT UNIQUE, name, description,
         created_by → users, archived bool DEFAULT false, next_issue_seq BIGINT DEFAULT 0,
         created_at, updated_at)
project_members(project_id → projects, user_id → users, role project_role, added_by → users,
                PK(project_id, user_id))

-- workflow (data, not enum — this is what makes Jira customizable)
workflow_states(id PK, project_id → projects, name, category, position, is_terminal bool)
tickets(id PK, project_id → projects, number BIGINT, identifier TEXT,   -- 'NW-143'
        title, description, type, priority, state_id → workflow_states,
        assignee → users NULL, reporter → users, due_date, story_points NUMERIC NULL,
        position NUMERIC,              -- fractional ordering for drag & drop
        version BIGINT DEFAULT 1,      -- optimistic concurrency
        created_at, updated_at,
        UNIQUE(project_id, number))
CREATE INDEX ON tickets(project_id, state_id);
CREATE INDEX tickets_fts ON tickets USING GIN(to_tsvector('english', title || ' ' || description));

-- collaboration
comments(id PK, ticket_id → tickets, author → users, body, created_at, updated_at)
labels(id PK, project_id → projects, name, color); ticket_labels(ticket_id, label_id)
ticket_links(from_ticket, to_ticket, link_type)          -- blocks/relates/duplicates
sprints(id PK, project_id, name, goal, starts_at, ends_at, state)
ticket_sprint(ticket_id, sprint_id)

-- audit (non-negotiable for a tracker)
ticket_events(id PK, ticket_id → tickets, actor → users, event_type, payload JSONB, created_at)

-- future cross-module async (hybrid outbox — §9.6)
outbox(id PK, aggregate_type, aggregate_id, event_type, payload JSONB, created_at, published_at NULL)
```

Design decisions worth calling out:

- **`number` (BIGINT, per-project) + `identifier` (display string)**: the DB owns the number; the app
  composes `key || '-' || number`. Uniqueness on `(project_id, number)`; lookups by identifier can stay
  unique too.
- **`position NUMERIC`** (fractional cursors, Leitner-style `/2` rebalancing) so kanban drag-drop is a
  single-row `UPDATE`, not a full-column rewrite.
- **`version`** so concurrent card-moves from two users conflict loudly (409 + `If-Match`/`ETag`), instead
  of last-write-wins.
- **`ticket_events`** gives you the activity feed, audit trail, and (later) the event source for the
  outbox — from one insert-per-change.

### 4.4 Enums → workflow data

Statuses as a Postgres enum (`status`, `priority`) are the current model. Enums can't be reordered,
renamed, or made per-project without a migration each time — and you already hit the drift (K-11).
`workflow_states` as rows (with `category` grouping like Jira's "in progress"/"done" categories) makes the
board generic and the statuses customizable per project. `priority` can stay an enum short-term; promote
it to data when you want per-project priority schemes.

### 4.5 Atomic identifier allocation (fixes K-9)

```sql
-- name: AllocateTicketNumber :one
UPDATE projects SET next_issue_seq = next_issue_seq + 1
WHERE id = $1
RETURNING next_issue_seq;
```

Run inside the same transaction as the ticket insert (the row lock on the project row serializes
allocation per project; two projects never contend). Optionally add `pg_advisory_xact_lock(hashtext($1))`
if you want to keep the counter on a separate table. Identifier = `key || '-' || number`. Keep the
`23505` → `ErrTicketExists` mapping as a belt-and-braces, but with this scheme the client never chooses
identifiers, so conflicts become impossible rather than handled.

### 4.6 Seeding for development

The frontend's fake workspaces (K-10) should be replaced by a seed that runs *in the database*:
`sql/seed/001_dev.sql` (or a Go seeder behind `make seed`) creating: 1 org (`kizen`), 1 project
(`key='NW'`), 2 users, membership rows, a few workflow states and tickets with **fixed UUIDs** documented
in the seed file. The frontend then renders whatever `/api/projects` returns — no hardcoded UUIDs in TS.

### 4.7 Tenant isolation inside one database

Because the DB is shared (by design), enforce scoping in two layers:

1. **Application layer (primary):** every repository method takes the caller's org/project scope from
   the request context (set by auth middleware), and every query is written scope-first
   (`WHERE organization_id = $1 AND ...`). Never trust a client-supplied org id.
2. **Postgres RLS (defense in depth):** once org_id is on the hot tables (or resolvable via membership),
   enable row-level security and set the tenant per transaction:

   ```sql
   ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tickets FORCE ROW LEVEL SECURITY;
   CREATE POLICY org_isolation ON tickets USING (
     project_id IN (SELECT project_id FROM project_members
                    WHERE user_id = current_setting('app.user_id')::uuid)
   );
   -- per request/tx: SET LOCAL app.user_id = '...';
   ```

   This converts "someone forgot the WHERE clause" from a data breach into a zero-row query.

3. **Per-module DB roles** (§9.3): `kizen_tickets` role can only touch ticket/project tables;
   `kizen_identity` only user/session tables — even though it's one database, one Postgres, one
   connection pool each.

### 4.8 Connection pooling across services sharing one DB

Each service currently opens its own `pgxpool` with defaults (`MaxConns = max(4, NumCPU)`). With N
services × pools against one Postgres with default `max_connections=100`, you can exhaust connections
without any real load. Rules: set explicit `MaxConns` per pool so the sum stays well under
`max_connections` (leave headroom for migrations/admin), set `MaxConnLifetime` (~30m) + `MaxConnIdleTime`
(~5m) + `AfterRelease` health checks, and plan PgBouncer (transaction mode + pgx `QueryExecModeExec`
or `DescribeExec`) only when the numbers demand it — not before.

---

## 5. Backend (Go) — code quality

### 5.1 Error taxonomy: good bones, missing spine

Sentinel errors + `errors.Is/As` + `pgconn.PgError` code mapping (23505→409, `ErrNoRows`→404) — all correct
instincts, and better than most first projects. What's missing is a *single place* that finishes the job:

```go
// internal/platform/httpx/errors.go
func RespondError(w http.ResponseWriter, r *http.Request, logger *slog.Logger, err error) {
    var dErr *domain.Error            // structured domain error with Kind + validation details
    switch {
    case errors.As(err, &dErr):
        status := kindToStatus[dErr.Kind]        // Invalid→400, NotFound→404, Conflict→409, ...
        respond.Problem(w, r, status, dErr)
    default:
        logger.Error("unhandled error", "error", err)
        respond.Problem(w, r, http.StatusInternalServerError, "internal error") // never leak err
    }
}
```

Then handlers end with exactly one line: `httpx.RespondError(w, r, h.logger, err); return`. This deletes
every `switch` in `handler.go`, removes the K-5 return-miss class of bug, guarantees uniform problem+json
bodies (K-6), and keeps internal details (SQL, driver errors) out of responses.

For validation specifically, replace `fmt.Errorf`-string building in `validateTicket` with a collected
field-error list so the 400 can say *which* fields failed (`{"detail":"validation failed","errors":{"title":"must not be blank"}}`)
— the current design throws that information away at the handler boundary.

### 5.2 The service layer is currently a pass-through — decide what it's for

`service.go` `GetByID`/`Delete` forward to the repo unchanged; `Create` validates. That's fine at this
size, but write down the rule now: **handlers never touch repositories; services own transactions,
invariants, and cross-aggregate effects** (identifier allocation §4.5, `ticket_events` insert §4.3,
future notifications). The moment you add "update ticket state," the invariant checks (legal transitions
per workflow, permission to move to done) belong here — not in the handler, not in SQL triggers.

### 5.3 Dead and drifting code

- `memory.go` implements only `Create` → it no longer satisfies `domain.TicketRepository`
  (`GetByID`/`Delete` missing) and keys by `ticket.ID` while Postgres keys by `(project_id, identifier)`.
  A test double that drifts from the interface is worse than none: it passes tests the real repo would
  fail. Fix: implement the full interface with the *same* semantics (keyed by project+identifier), wire
  it into unit tests (§5.6).
- `const op = "..."` is declared and never used in five places (`handler.go:43,97,133`,
  `service.go:23,65`...). Either thread it into a structured error type (`errcode.Err{Op, Code, Cause}`),
  or delete it. Right now it's noise.
- `pool.go` exists in *two* places: `internal/database` (generated, package `database`) and
  `services/ticket-service/internal/infrastructure/database` (package `database`). Main imports one as
  `database`, the repository imports the other — two different `database` packages in one program. Rename
  the infra one to `platform/postgres` and the generated one per-module (`modules/tickets/repository/db`).
- Commented-out code blocks (`handler.go:160-166`, `postgres.go:26-29`, `repository.go:13-14`,
  `create_service.go`'s comment essay): git history is the archive. Delete them; keep the repo
  legible.

### 5.4 Complete the CRUD surface + pagination before the frontend grows

Missing: `List` (commented out in `repository.go:13`), `Update`, `UpdateState` (kanban move),
`UpdateAssignee`, `ListByAssignee`. Every list endpoint must be **keyset-paginated** (not OFFSET) with
filter (status, assignee, priority) and a **whitelisted sort** — see the query sketch in K-8. Sorting by
arbitrary client strings means either a `CASE` whitelist in SQL or a sqlc `narg` builder; never string
interpolation.

### 5.5 The HTTP surface needs a standard middleware stack and health endpoints

Today: zero middleware (no request logging, no recover, no request id, no body limit) and no
`/healthz`/`/readyz` (so Compose/Traefik can't actually health-check the *service*, only Postgres can be
checked — the `depends_on` is DB-only and Traefik has no healthcheck label):

```go
r := chi.NewRouter()
r.Use(middleware.RequestID, middleware.RealIP, middleware.Recoverer,
      middleware.Timeout(15*time.Second), logging.Middleware(logger), middleware.MaxBytes(1<<20))

r.Get("/healthz", healthz)                 // liveness: process is up
r.Get("/readyz", readiness(dbPool.Ping))   // readiness: DB reachable

r.Route("/api", func(api chi.Router) {
    api.Route("/projects/{projectID}/tickets", func(r chi.Router) {
        r.Post("/", h.Create)
        r.Get("/", h.List)
        r.Get("/{identifier}", h.Get)
        r.Patch("/{identifier}", h.Update)
        r.Delete("/{identifier}", h.Delete)
    })
})
```

`slog` request-access logs (method, path, status, duration, request_id) are the minimum observability
needed to debug K-1-class outages today; you currently learn nothing from a 502.

### 5.6 Testing strategy — you have tests; they are gitignored

`.gitignore:7-9` literally ignores tests (`service_test.legacy`, `test_cases`, `web.legacy`). The service
test that exists (would cover `Create` happy/conflict paths via the in-mem repo) was disabled by renaming
it `.legacy` — presumably because the in-mem repo drifted (§5.3) and stopped compiling. **This is the
single most damaging process decision in the repo: untracked, unrunnable tests are pure liability.**

Recommended stack, in order of value:

1. **Unit (service layer)** with a *contract-faithful* fake repo — revive the `.legacy` test, make the
   fake implement the whole interface with the same keying semantics.
2. **Integration (repository layer)** against real Postgres via
   [testcontainers-go](https://golang.org/testcontainers) — apply migrations, run every query, assert the
   `23505`/`ErrNoRows` mappings. This would have caught K-3 (the SELECT-as-DELETE) immediately.
3. **HTTP (handler layer)** with `httptest` — assert status codes, problem+json shape, and the
   param-handling (would have caught K-4/K-5).
4. **Contract (OpenAPI)** — validate handler responses against the spec (`kin-openapi` middleware in a
   test-only router).
5. **E2E (browser)** — Playwright for the golden paths (§6.7).

Run all of it in CI on every push (§7.6).

### 5.7 Config: fail fast, validate, document

`config.Load` returning silently-empty strings is exactly how K-1 shipped. Replace with
[caarlos0/env](https://github.com/caarlos0/env) or `kelseyhightower/envconfig`:

```go
type Config struct {
    ServerPort  string `env:"SERVER_PORT" envDefault:"8080"`
    DatabaseURL string `env:"DATABASE_URL,required"`
    LogLevel    string `env:"LOG_LEVEL"   envDefault:"info"`
}
```

Parse at boot; on missing/invalid → log a precise message and exit(1). Commit `.env.example` listing
every variable with a one-line description (§7.6 CI duplicates the check).

### 5.8 Pool construction should be explicit

```go
cfg, _ := pgxpool.ParseConfig(url)
cfg.MaxConns = 10
cfg.MinConns = 2
cfg.MaxConnLifetime = 30 * time.Minute
cfg.MaxConnIdleTime = 5 * time.Minute
pool, err := pgxpool.NewWithConfig(ctx, cfg)
```

Also add a bounded retry/backoff loop around `NewPool`+`Ping` at startup so transient DB unavailability
doesn't crash-loop the binary (Compose restarts help, but the app should tolerate slow DBs anyway).

### 5.9 Repository mapping hygiene

The `pgtype.UUID{Bytes: ..., Valid: true}` → `uuid.UUID(...)` copy-paste appears 6 times and dropped two
fields (K-12). Centralize (helpers in §K-12), and add a one-way mapper file per aggregate
(`toDomain(row)`, `toParams(t)`) so a new column surfaces as a compile error in exactly one place, not a
silent omission at three call sites.

### 5.10 sqlc configuration corrections

- `sqlc.yaml:1` `version : "2"` — works, but tidy to `version: "2"`.
- Overrides `db_type: UUID` / `TIMESTAMPZ` (uppercase) **never match** — sqlc compares lowercase
  `uuid`/`timestamptz`. Either fix the casing or drop the overrides and keep the `pgtype` mapping helpers.
  Decide once, document in the file.
- `schema: sql/migrations` pointing at hand-written "migration" scripts means sqlc parses the same files
  that (fail to) run in initdb — keep them as *the* single schema source, but once a migration tool owns
  them (§4), ensure sqlc's schema path matches the applied chain, and generate per-module (§9.3).
- Add `rules: [sqlc/db-prepare]` comment discipline and prefer `:execrows` for deletes, `:one` with
  `RETURNING` for inserts (you already do this — good).

---

## 6. Frontend — detailed review

### 6.1 Architecture: one Context does everything

`TicketsContext` currently owns: server state (tickets), fake reference data (workspaces, user, seeds),
UI state (tab, view, search, modal), derived data (metrics, filters), mutations (create), and notifications
(toasts). `value` is rebuilt every render (not memoized — every keystroke in search re-renders every
consumer), and `loading` is one boolean shared by composer *and* modal.

**Target split:**

- **Server state → TanStack Query.** `useQuery(['projects'])`, `useQuery(['tickets', projectId, filters])`,
  `useMutation(createTicket)` with cache invalidation. Get retry/refetch/dedup/suspense for free.
- **UI state → small contexts or zustand.** `activeTab`, `viewMode`, `searchQuery`, `isCreateModalOpen`.
- **Toasts → a leaf `Toaster` component** with its own subscription store, not inside the data provider.

This dissolves ~200 lines of the context and makes every data flow testable in isolation.

### 6.2 Remove the fabrications

- `SEED_TICKETS`, `WORKSPACES`, `DEFAULT_USER`, `issueCounter` — delete (K-8/K-9/K-10).
- `StatusRow`'s hardcoded `+3 this week`, `unchanged`, `2 overdue` — compute from real data or hide the
  widget until you have the data to back it. Fabricated metrics train users to distrust the product.
- `normalizeTicket`'s invented fallbacks (`'ISSUE-0'`, `'Untitled Issue'`, UUID-slice initials) —
  delete with the normalizer once the contract is fixed (K-7). If data is missing, *show* missing, don't
  invent.
- `dueDate` is typed `string | null` but holds `'Fri'`/`'Today'` in seeds and ISO timestamps from the API —
  one honest type (`string | null`, ISO-8601) and a formatter.

### 6.3 Modal accessibility (P2)

`CreateIssueModal` opens with `role="dialog" aria-modal="true"` but: no `Escape` to close, no focus trap,
focus isn't moved into the dialog on open, and it isn't restored to the opener on close. For keyboard and
screen-reader users the dialog is effectively invisible. Use `dialog` element semantics (or a11y-kit's
`useModalDialog`) and wire Escape + focus cycle. Same story for `IssueRow`/kanban cards: `role="listitem"`
lives inside a parent that isn't `role="list"`, and interactive rows are `div`s with `tabIndex` and no
keyboard activation.

### 6.4 The board isn't a board yet

Kanban has columns but no drag-and-drop, no reorder, no move-to-column — the core interaction of the
product. Plan for: `@dnd-kit` (accessible DnD) + `PATCH /api/projects/{id}/tickets/{key}` with
`position` (§4.3) + optimistic update with rollback on failure + `ETag`/`version` conflict handling
(409 → refetch that ticket). Build the optimistic-update path *first*; retrofitting rollback semantics
after every component hardcodes `setTickets` is far harder.

### 6.5 Routing and feature gaps

No router: Starred/Trash/Settings/Rail buttons are dead. Add `react-router` early — even a handful of
routes (`/`, `/project/:key`, `/issues/:key`, `/login`) — because auth (§3) needs redirects, and deep
links to issues are table stakes for a tracker.

### 6.6 Smaller items

- `Toast` timeouts aren't cleaned up on unmount (leak on provider teardown).
- `client.ts` invents statuses: `AbortError → 408`, network failure → `500` — client-side failures
  masquerading as HTTP statuses mislead error handling; use a distinct `NetworkError` class.
- Google Fonts loaded from CDN in `index.html` — self-host (woff2 + `font-display: swap`) for offline dev,
  determinism, and CSP friendliness.
- `nextIdentifier` prop-drills a fabricated value into the modal; the server should return the identifier
  (K-9) — the field disappears from the form entirely.
- Bleeding-edge deps (Vite 8, TS 6, ESLint 10, React Compiler via Babel) — fine for learning, but pin
  exact versions in CI and expect occasional breakage; the React Compiler itself is a good fit for this
  codebase (mostly pure components), keep it.

### 6.7 Frontend testing (none exists)

Minimum viable suite: **Vitest + Testing Library** for `TicketsContext` reducers and form validation;
**MSW** to mock `/api` for component tests (no server needed); **Playwright** for 3 E2E paths:
login → create issue → see it in list; move card on board; search filter. Wire into CI (§7.6).

---

## 7. Infrastructure & delivery

### 7.1 Dockerfiles

**`ticket-service.Dockerfile`** builds `FROM alpine` and *copies a prebuilt host binary* — the image
isn't reproducible without the host's Go toolchain and `build/` state, and Tilt is now the only way to
produce it. Make it self-contained and hardened:

```dockerfile
FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/kizen ./services/ticket-service/cmd

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/kizen /kizen
USER nonroot
EXPOSE 8080
ENTRYPOINT ["/kizen"]
```

(cgo-free static binary → distroless/static; add `ca-certificates` only if you dial HTTPS; keep CGO off
via build args in Tilt for host builds.)

**`web.Dockerfile`** is a reasonable node→nginx two-stage, but: pin `node:22.x-alpine`/`nginx:1.27-alpine`
(prefer digests), run nginx as non-root or drop capabilities, and add a `HEALTHCHECK`.

### 7.2 `docker-compose.yaml` hardening checklist

- Remove `--api.insecure=true` / unpublish `8080` (S-3).
- Pin images (`postgres:17-alpine` is fine; `traefik:v3.7` fine; alpine/nginx floating in Dockerfiles).
- Add `restart: unless-stopped` to `web`/`ticket-service` (only `database` has it).
- Resource limits (`mem_limit`/`cpus` or `deploy.resources`) and log rotation
  (`logging: {driver: json-file, options: {max-size: "10m", max-file: "3"}}`) — otherwise logs grow
  unbounded and one leaky container starves the host.
- `read_only: true` + `tmpfs` for nginx; `cap_drop: [ALL]` where possible.
- Postgres: `command` with tuned `-N`/`shared_buffers` later; add `POSTGRES_PASSWORD_FILE`-style secret
  handling for anything beyond laptop dev; **add a backup story** (nightly `pg_dump` to a volume/S3, or
  wal-g) — semi-production without backups isn't production, it's a demo with data loss.
- The `web` service loads the entire root `.env` (`env_file`) but needs none of it — give the web image
  no secrets at all (it's static files).

### 7.3 nginx config

- `index.html` is served by `try_files ... /index.html` **without a `no-cache` header** → after a deploy,
  returning users get the old shell referencing hashed bundles that no longer exist (white screen until
  hard refresh). Add:
  ```nginx
  location = /index.html { add_header Cache-Control "no-cache"; }
  ```
- Add security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  a CSP that allows self + your fonts once self-hosted). `gzip_types` is missing `image/svg+xml`
  (the favicon is SVG); consider `textcompression` via brotli later.

### 7.4 Tiltfile & start.sh

- `local_resource` deps reference `./shared` (deleted — see your own commit "remove shared dir") and
  `./internal/database/postgres` (doesn't exist; the generated package is `internal/database`) — stale
  paths. Docker build `only` also includes the nonexistent `./shared`.
- `start.sh` runs `minikube start` then `tilt up` — but nothing here uses Kubernetes: Tilt drives
  `docker-compose.yaml`. Either delete minikube (recommended at this stage — Compose is the right tool
  until you need >1 host) or actually target k8s manifests; today the script boots a cluster that is then
  unused, confusing every contributor.
- Add a `local_resource` for `sqlc generate` (watch `sql/**`) and one for `web` dev server to complete
  the inner loop; today only ticket-service compiles are live.

### 7.5 There is no `.dockerignore` (P1 performance hazard)

`docker build .` (web.Dockerfile context is `.`) ships **the entire repo** to the daemon — including
`web/node_modules`, `web.legacy/node_modules` (an entire second Svelte app!), `.git` history, and the
15 MB `build/` binaries. Then `COPY web ./` drags `web/node_modules` into the build stage. Fix:

```
# .dockerignore
**/node_modules
web.legacy
.git
build
dist
.env*
*.md
```

(This is a multi-GB context/time difference on cold caches.)

### 7.6 CI — there is none (no `.github/` at all)

Minimum pipeline (GitHub Actions, single workflow, ~60 lines):

1. **backend:** `gofmt -l`, `go vet`, `staticcheck`, `go test ./...` (unit) — plus an integration job
   with a `postgres:17` service container: apply **migrations to a fresh DB** (catches K-2 class bugs),
   run integration tests.
2. **frontend:** `npm ci`, `tsc -b`, `eslint .`, `vitest run`.
3. **images:** `docker build` both Dockerfiles (catches broken Dockerfiles), `trivy image` scan.
4. **compose smoke:** `docker compose up -d --wait` then `curl /healthz` and a real
   create-ticket round-trip — this one job would have caught K-1, K-2, K-3 and K-4 before any human did.

Run it on every PR; add release tagging later.

### 7.7 API contract (OpenAPI) — finish what you started

You have an `openapi-integration` branch — this is the right instinct and the *keystone* fix for K-6/K-7/
K-11. Commit `api/openapi.yaml` as the source of truth: paths, problem+json error schema, ticket DTOs,
workflow states. Generate: server types + chi-friendly validation (`oapi-codegen` or `kin-openapi`
request validation) and TS client types (`openapi-typescript` + `openapi-fetch` — deletes
`RawTicketResponse` and hand-rolled `APIClient` URL building). Contract tests in CI keep spec and
handlers honest.

---

## 8. Repository & process hygiene

| Item | Finding | Fix |
|---|---|---|
| Root README | Missing (only `web/README.md`, a Vite template stub) | Created in this audit (see `README.md`) |
| Tests gitignored | `.gitignore:7-9` excludes tests | Un-ignore; revive (§5.6) |
| Untracked work | `services/user-service/` is `??` in `git status` | Commit or delete — untracked source is one `git clean` away from vanishing |
| Branch name | `developement` (typo, and it's the default branch) | Rename to `main`/`develop` (once, while it's cheap) |
| No CI | no `.github/` | §7.6 |
| No `.env.example` | required vars are folklore (K-1 root cause) | Commit one; CI parses it |
| Commit style | Fine-grained messages, good subjects | Adopt Conventional Commits to enable changelog/version tooling later |
| `scripts/create_service.go` | Scaffolds empty dirs only | Either grow it into a real generator (dirs + go files + wiring + Dockerfile) or delete; half-tools rot |
| `web.legacy/` | Entire SvelteKit app in working tree (gitignored but still ~GB with node_modules) | Move out of the repo entirely |
| Single Go module | Good — matches the hybrid goal | Keep one module (§9.3) |

---

## 9. Target architecture — the hybrid you asked for

### 9.1 Name what you're actually building

Your constraints: *not a full microservice system, monolithic database, semi-production*. The honest
architecture for that is a **modular monolith**: one deployable binary, strictly-bounded internal modules,
one Postgres owned end-to-end, with service-extraction as a *later option* rather than a starting
position. What you have today is the awkward middle — two services where one is empty, one shared DB, no
communication story, shared generated code as coupling glue, and a reverse proxy doing the job an in-process
router would do better.

### 9.2 Why this shape fits (and microservices don't, yet)

- **One team, one deploy, one database.** Microservices buy *organizational* parallelism (many teams,
  many deploys). With one author you'd be paying the distributed-systems tax (network failures, eventual
  consistency, per-service pipelines) and receiving none of the benefit.
- **The monolith DB is a feature here**, not a compromise: transactional invariants across tickets/
  projects/members are trivial in SQL and painful across services. Jira-class invariants (unique issue
  numbers per project, workflow legality, member visibility) live happily in one schema with RLS.
- **Extraction remains possible** only if module boundaries are real (below). Boundaries are what make
  later extraction cheap; starting distributed doesn't create boundaries, it just distributes the mess.

### 9.3 Concrete layout

```
kizen/
├── cmd/kizen/main.go                 # ONE deployable; wires modules
├── internal/
│   ├── platform/                     # shared kernel — NO business logic
│   │   ├── config/                   # env parsing, fail-fast validation
│   │   ├── postgres/                 # pool construction, tx helper, RLS scope setter
│   │   ├── httpx/                    # respond/problem+json, middleware, request logging
│   │   ├── logger/                   # slog setup
│   │   └── errors/                   # error kinds, kindToStatus
│   ├── modules/
│   │   ├── identity/                 # users, orgs, memberships, sessions, auth
│   │   │   ├── domain/               # entities + repository/service interfaces
│   │   │   ├── service/              # business rules (argon2id, session lifecycle)
│   │   │   ├── repository/           # sqlc queries + mappers (module-private)
│   │   │   │   └── db/               # generated sqlc for this module only
│   │   │   └── transport/            # chi routes + DTOs for /api/auth, /api/me, /api/orgs...
│   │   ├── projects/                 # orgs→projects→members→workflow states
│   │   ├── tickets/                  # tickets, comments, labels, events
│   │   └── (later: search/, notify/)
│   └── app/                          # module registry: mounts module routers, DI wiring
├── sql/
│   ├── migrations/                   # ONE ordered chain, tool-managed (§4)
│   └── seed/                         # dev seeds (§4.6)
├── api/openapi.yaml                  # contract-first (§7.7)
├── web/                              # unchanged shape (React SPA)
├── infra/docker/                     # Dockerfiles, nginx, compose overlays
└── scripts/
```

**The rules that make boundaries real:**

1. **Modules may import another module's `service` interface — never its `repository`, `db`, or
   `domain` internals.** (Enforce with `go list`/`depguard` in CI: import graph must be
   `platform ← modules`, `transport → service → domain`, and nothing crosses into another module's
   `repository`.)
2. **Each module's sqlc queries live under its own package and may only reference tables it owns.**
   `tickets` never writes a query joining `users` beyond FK-respecting reads it owns (e.g., its own
   `users_ref` snapshot columns or an explicit call into identity's service).
3. **`platform` contains zero business types.** If two modules "need" to share a domain struct, that's a
   design smell: share a *service method*, not a table or a struct.
4. **Transactions cross modules through services**, and services accept a `DBTX` (the sqlc `DBTX`
   interface you already have in `internal/database/db.go`) so a caller can compose a transaction across
   two module operations when a true cross-aggregate invariant demands it — rare, but the escape hatch
   belongs in code, not in queries reaching across tables.

### 9.4 Request flow (the whole system in one process + static web)

```
browser ──HTTP──▶ Traefik (TLS, /api/* → app; rest → nginx static)
                       │
                       ▼
              cmd/kizen (chi router)
              ├─ middleware: requestID, realIP, recover, timeout, access-log, maxBytes, auth(session)
              ├─ /api/auth/*        → identity module
              ├─ /api/me            → identity
              ├─ /api/orgs/:/projects/... → projects module
              └─ /api/projects/{id}/tickets/... → tickets module
                       │  service → repository → sqlc → pgxpool
                       ▼
                 Postgres (single schema, RLS by app.user_id, module GRANTs, one migration chain)
```

- **Traefik stays** as edge (TLS termination, future rate limiting), but the "service mesh via path
  prefixes over Docker labels" collapses to two backends: the app and static web. One thing to deploy,
  one thing to health-check (`/healthz`, `/readyz` — Traefik label `traefik.healthcheck.path=/healthz`).
- Scaling = run `docker compose up --scale kizen=N` (stateless app + pgbouncer when needed). That *is*
  semi-production.

### 9.5 Auth design for this shape

Cookie sessions (not JWT) are the right default here: revocable server-side (session table), no token
juggling in the SPA, CSRF handled classically, and a single domain means no cross-origin token plumbing.
JWT becomes interesting only when you *extract* services later — and then it's an internal concern
(gateway-issued short-lived tokens), still not a browser concern.

### 9.6 Cross-module effects now, events later

Today: direct service calls (e.g., tickets calls identity's `UserLookup`). When you need "on ticket
created → notify watchers / update counters," don't bolt on Redis or Kafka — write an `outbox` row in the
**same transaction** as the business change (§4.3) and have an in-process dispatcher poll and deliver
(initially: just to in-process listeners; later: to extracted services). This gives you reliable events
with zero new infrastructure, and it's the pattern you'd keep if/when you ever split the DB per module.

### 9.7 Extraction criteria — when a module *earns* its own service

Split only when at least one of these is measurably true:

- A module needs a **different scaling profile** (e.g., search indexing pegs CPU while CRUD idles).
- A module needs a **different availability/deploys cadence** (hotfix a notifier without redeploying core).
- **>1 team** and the interface between areas is stable.
- A module needs a **different datastore** that genuinely fits (FTS engine, vector store).

Until then, every "microservice prep" you do should be spent on §9.3's boundary rules — those are the
only things that make extraction cheap later. Premature split + shared DB (your current shape) is the
one combination with all costs and no benefits: network hops between processes that share tables anyway.

### 9.8 What happens to the existing services directory

- `services/ticket-service/**` content moves to `internal/modules/tickets` nearly file-for-file
  (your layering is already right). `cmd/main.go` becomes the module's transport wiring.
- `services/user-service/internal/domain/user.go` becomes the seed of `modules/identity/domain`.
- `internal/database` (generated) regenerates per-module under each `repository/db`.
- `scripts/create_service.go` becomes `scripts/create_module.go` scaffolding the module tree — now it's
  a tool that matches the architecture.

---

## 10. Roadmap (ordered, with acceptance criteria)

**Phase 0 — Make it work at all (P0s). Days, not weeks.**
Fix K-1…K-12 in order of blast radius: env/config (K-1), migration tooling + schema fixes (K-2), DELETE
query (K-3), routes/returns (K-4/K-5), error contract (K-6/K-7), server-side identifiers (K-9), real
list endpoint + frontend fetch (K-8/K-10), enum unification (K-11), nullable mapping (K-12).
*Done when:* `docker compose up` on a fresh machine, plus one Playwright-style scripted flow
(create issue → reload → it's still there) works.

**Phase 1 — Identity and tenancy.** Auth (S-1), sessions, org/project/member tables real (§4.3),
RLS or scope-first queries (§4.7), seeding (§4.6), frontend login + real projects list.
*Done when:* you cannot read a project's tickets without membership; `created_by` comes from the session.

**Phase 2 — The actual Jira domain.** Comments, labels, workflow states as data (§4.4), board DnD with
optimistic updates + version conflicts (§6.4), search (FTS index + query), ticket detail page + routing,
activity feed from `ticket_events`.
*Done when:* a two-user concurrent move produces a sane conflict, and search finds tickets by title.

**Phase 3 — Semi-production hardening.** CI full pipeline (§7.6), OpenAPI contract + codegen (§7.7),
container hardening (§7.1/§7.2), nginx caching/headers (§7.3), Traefik TLS + no dashboard (S-3/S-4),
backups (§7.2), `/metrics` + alert on 5xx/p99, `.env.example` discipline (§5.7).
*Done when:* a fresh contributor goes clone → `docker compose up` → working app with tests green in CI,
without asking you anything.

**Phase 4 — Forward motion.** Outbox + notifications (§9.6), sprints/roadmap UI, attachments (S3/minio),
audit log UI, i18n, and — only if a §9.7 trigger fires — first module extraction behind the gateway.

---

## 11. What you're already doing right (keep all of this)

- **sqlc for data access** — right tool; the generated-parameterized code eliminates an entire bug class.
- **hexagonal layering inside ticket-service** (domain interfaces → service → infrastructure) — maps
  cleanly onto the module structure proposed in §9.3.
- **Sentinel errors + `errors.Is` + `pgconn.PgError` mapping** — the taxonomy instinct is correct; §5.1
  just finishes it.
- **Graceful shutdown** with signal handling, error channel, and drain timeout — most first projects
  don't have this at all.
- **slog JSON with leveled output**, `defer pool.Close()`, boot-time `Ping` — solid process hygiene.
- **Traefik + Compose + Tilt for dev loop** — the right tool family for a single-host hybrid; only the
  details (§7) are off.
- **Typed frontend API client with `AbortController` timeouts and a typed error class** — better than
  90% of first SPAs; it just needs a server that honors the contract (K-6/K-7).
- **React + TypeScript + React Compiler, component folder structure** — consistent, readable, and the
  component split (board/modal/toolbar/layout) is genuinely clean.
- **Small, descriptive commit history** with real subjects — future you will be grateful.

---

*End of analysis. Every P0 here is verified against the current working tree (paths and line numbers
referenced throughout); the roadmap in §10 is sequenced so that each phase leaves the system in a
working state.*
