# ==============================================================================
# KIZEN - Production Makefile
# ==============================================================================
# Usage:
#   make              # Display help
#   make deps         # Install and verify all project dependencies
#   make up           # Production deployment via Docker Compose
#   make down         # Stop running containers
#   make test         # Run test suites across services
# ==============================================================================

SHELL := /usr/bin/env bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

# ------------------------------------------------------------------------------
# Configuration & Variables
# ------------------------------------------------------------------------------
PROJECT_NAME     := kizen
DOCKER_COMPOSE   := docker compose
DOCKER           := docker
GO               := go
BUN              := bun
SQLC             := sqlc

# Colors for terminal output
BOLD    := \033[1m
GREEN   := \033[32m
YELLOW  := \033[33m
CYAN    := \033[36m
RED     := \033[31m
RESET   := \033[0m

# ==============================================================================
# HELP
# ==============================================================================
.PHONY: help
help: ## Display this help screen
	@printf "\n$(BOLD)%s$(RESET)\n" "Kizen Project Automation & Deployment"
	@printf "%s\n\n" "Run 'make <target>' to execute a command:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / { \
		printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2 \
	}' $(MAKEFILE_LIST)
	@echo ""

# ==============================================================================
# DEPENDENCIES & ENVIRONMENT SETUP
# ==============================================================================
.PHONY: check-tools
check-tools: ## Verify required tools are installed on host
	@printf "$(YELLOW)==> Checking required system tools...$(RESET)\n"
	@command -v $(DOCKER) >/dev/null 2>&1 || { printf "$(RED)Error: docker is required.$(RESET)\n" >&2; exit 1; }
	@$(DOCKER_COMPOSE) version >/dev/null 2>&1 || { printf "$(RED)Error: docker compose plugin is required.$(RESET)\n" >&2; exit 1; }
	@command -v $(GO) >/dev/null 2>&1 || printf "$(YELLOW)Notice: go is not in PATH (needed for local builds).$(RESET)\n"
	@command -v $(BUN) >/dev/null 2>&1 || printf "$(YELLOW)Notice: bun is not in PATH (needed for local web builds).$(RESET)\n"
	@printf "$(GREEN)✓ Core host tools verified.$(RESET)\n"

.PHONY: env-file
env-file: ## Ensure .env file exists from .env.example if missing
	@if [ ! -f .env ]; then \
		printf "$(YELLOW)==> Creating .env from .env.example...$(RESET)\n"; \
		cp .env.example .env; \
		printf "$(GREEN)✓ Created .env file. Please check secrets before production use.$(RESET)\n"; \
	fi

.PHONY: deps-go
deps-go: ## Download and verify Go modules
	@printf "$(YELLOW)==> Downloading Go modules...$(RESET)\n"
	$(GO) mod download
	$(GO) mod verify
	@printf "$(GREEN)✓ Go dependencies installed.$(RESET)\n"

.PHONY: deps-web
deps-web: ## Install frontend npm/bun packages
	@printf "$(YELLOW)==> Installing web dependencies with bun...$(RESET)\n"
	cd web && $(BUN) install --frozen-lockfile || cd web && $(BUN) install
	@printf "$(GREEN)✓ Web dependencies installed.$(RESET)\n"

.PHONY: deps-tools
deps-tools: ## Install development code generators (sqlc) if missing
	@if ! command -v $(SQLC) >/dev/null 2>&1; then \
		printf "$(YELLOW)==> Installing sqlc...$(RESET)\n"; \
		$(GO) install github.com/sqlc-dev/sqlc/cmd/sqlc@latest; \
	fi
	@printf "$(GREEN)✓ Generator tools ready.$(RESET)\n"

.PHONY: deps
deps: check-tools env-file deps-go deps-web deps-tools ## Install all project dependencies (Go, Web, Tools)
	@printf "\n$(BOLD)$(GREEN)=== All dependencies installed and verified ===$(RESET)\n\n"

# ==============================================================================
# CODE GENERATION & DATABASE SCHEMA
# ==============================================================================
.PHONY: generate
generate: generate-sql generate-web ## Run all code generation pipelines (sqlc, routes)

.PHONY: generate-sql
generate-sql: ## Compile SQL queries and generate type-safe Go code with sqlc
	@printf "$(YELLOW)==> Running sqlc generate...$(RESET)\n"
	$(SQLC) generate
	@printf "$(GREEN)✓ Database packages generated in internal/database/.$(RESET)\n"

.PHONY: generate-web
generate-web: ## Generate TanStack Router route tree
	@printf "$(YELLOW)==> Generating TanStack Router routes...$(RESET)\n"
	cd web && $(BUN) run generate-routes
	@printf "$(GREEN)✓ Web route tree generated.$(RESET)\n"

.PHONY: auth-migrate
auth-migrate: ## Run Better Auth migrations against live Postgres instance
	@printf "$(YELLOW)==> Running Better Auth database migrations...$(RESET)\n"
	cd web && $(BUN) x @better-auth/cli migrate --yes
	@printf "$(GREEN)✓ Better Auth migrations applied.$(RESET)\n"

.PHONY: auth-generate
auth-generate: ## Dump Better Auth schema to sql/migrations/users.sql and run sqlc
	@printf "$(YELLOW)==> Generating Better Auth SQL schema from live database...$(RESET)\n"
	cd web && $(BUN) x @better-auth/cli generate --config ./src/lib/auth.ts --output ../sql/migrations/users.sql --yes
	$(SQLC) generate
	@printf "$(GREEN)✓ users.sql and Go sqlc models updated.$(RESET)\n"

# ==============================================================================
# QUALITY CHECKS & TESTING
# ==============================================================================
.PHONY: lint
lint: ## Run linters across Go and Web codebases
	@printf "$(YELLOW)==> Running Go vet...$(RESET)\n"
	$(GO) vet ./...
	@printf "$(YELLOW)==> Running Biome check in web...$(RESET)\n"
	cd web && $(BUN) run check
	@printf "$(GREEN)✓ Linting checks passed.$(RESET)\n"

.PHONY: fmt
fmt: ## Format Go and Web source files
	@printf "$(YELLOW)==> Formatting Go files...$(RESET)\n"
	$(GO) fmt ./...
	@printf "$(YELLOW)==> Formatting Web files...$(RESET)\n"
	cd web && $(BUN) run format
	@printf "$(GREEN)✓ Formatting complete.$(RESET)\n"

.PHONY: test
test: test-go ## Run automated test suites
	@printf "$(GREEN)✓ All tests completed successfully.$(RESET)\n"

.PHONY: test-go
test-go: ## Run Go tests
	@printf "$(YELLOW)==> Running Go test suite...$(RESET)\n"
	$(GO) test -v ./...

# ==============================================================================
# LOCAL BUILDS (Host-level compilation)
# ==============================================================================
.PHONY: build-local
build-local: build-local-services build-local-web ## Build local binaries and web bundle on host

.PHONY: build-local-services
build-local-services: ## Compile Go microservice binaries into ./build
	@printf "$(YELLOW)==> Compiling Go services...$(RESET)\n"
	mkdir -p build
	CGO_ENABLED=0 $(GO) build -o build/ticket-service ./services/ticket/cmd
	CGO_ENABLED=0 $(GO) build -o build/workspace-service ./services/workspace/cmd
	@printf "$(GREEN)✓ Binaries built in build/$(RESET)\n"

.PHONY: build-local-web
build-local-web: ## Build web production bundle with bun
	@printf "$(YELLOW)==> Building web application...$(RESET)\n"
	cd web && $(BUN) run build
	@printf "$(GREEN)✓ Web build complete in web/dist/$(RESET)\n"

# ==============================================================================
# DOCKER & PRODUCTION DEPLOYMENT
# ==============================================================================
.PHONY: build
build: env-file ## Build all Docker containers
	@printf "$(YELLOW)==> Building Docker images via Compose...$(RESET)\n"
	$(DOCKER_COMPOSE) build

.PHONY: up
up: env-file ## Deploy all services in background (Single entrypoint for deployment)
	@printf "$(YELLOW)==> Deploying Kizen services with Docker Compose...$(RESET)\n"
	$(DOCKER_COMPOSE) up -d --build --remove-orphans
	@printf "\n$(BOLD)$(GREEN)✓ All services deployed successfully!$(RESET)\n"
	@printf "  - Web / Better Auth:  $(CYAN)http://localhost$(RESET)\n"
	@printf "  - Traefik Dashboard:  $(CYAN)http://localhost:8080$(RESET)\n"
	@printf "  - Workspace Service:  $(CYAN)http://localhost/api/v1/workspaces$(RESET)\n"
	@printf "  - Ticket Service:     $(CYAN)http://localhost/api/v1/tickets$(RESET)\n"
	@printf "\nRun $(YELLOW)make logs$(RESET) to stream logs, or $(YELLOW)make ps$(RESET) to view container health.\n\n"

.PHONY: dev
dev: env-file ## Start all services with live attached logs
	@printf "$(YELLOW)==> Starting services in foreground...$(RESET)\n"
	$(DOCKER_COMPOSE) up --build --remove-orphans

.PHONY: down
down: ## Stop and remove all running containers
	@printf "$(YELLOW)==> Stopping all services...$(RESET)\n"
	$(DOCKER_COMPOSE) down --remove-orphans
	@printf "$(GREEN)✓ All services stopped.$(RESET)\n"

.PHONY: down-v
down-v: ## Stop containers and remove volumes (Wipes database data)
	@printf "$(RED)==> WARNING: Wiping containers and persistent database volumes...$(RESET)\n"
	$(DOCKER_COMPOSE) down -v --remove-orphans
	@printf "$(GREEN)✓ Containers and volumes removed.$(RESET)\n"

.PHONY: restart
restart: down up ## Restart all services

.PHONY: logs
logs: ## Stream live logs from all containers
	$(DOCKER_COMPOSE) logs -f --tail=100

.PHONY: ps
ps: ## Display status of all running containers
	$(DOCKER_COMPOSE) ps

# ==============================================================================
# DATABASE UTILITIES
# ==============================================================================
.PHONY: db-shell
db-shell: ## Open an interactive psql shell inside the running PostgreSQL container
	@printf "$(YELLOW)==> Connecting to database 'kizen'...$(RESET)\n"
	$(DOCKER_COMPOSE) exec database psql -U postgres -d kizen

.PHONY: db-reset
db-reset: down-v up ## Reset database completely and redeploy schema
	@printf "$(GREEN)✓ Database reset and restarted with fresh migrations.$(RESET)\n"

# ==============================================================================
# CLEAN
# ==============================================================================
.PHONY: clean
clean: ## Remove temporary build files and bundles
	@printf "$(YELLOW)==> Cleaning build artifacts...$(RESET)\n"
	rm -rf build/
	rm -rf web/dist/
	rm -rf web/.tanstack/
	@printf "$(GREEN)✓ Clean complete.$(RESET)\n"
