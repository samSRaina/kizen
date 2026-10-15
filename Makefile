SHELL := /usr/bin/env bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

# Colors
CYAN  := \033[36m
GREEN := \033[32m
RESET := \033[0m

.PHONY: help up down dev db-migrate generate

help: ## Show available commands
	@echo "Kizen Project Automation"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(CYAN)%-15s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start the entire stack in background (Traefik, DB, API, Web)
	@echo "==> Booting Kizen stack..."
	docker compose up -d --build
	@echo "$(GREEN)✓ Services running at http://localhost$(RESET)"
	@echo "  - Traefik Dashboard: http://localhost:8080"
	@echo "  - API Health:        http://localhost/api/health"

down: ## Stop all running services
	docker compose down

dev: ## Start live-reload dev environment with Tilt
	@command -v tilt >/dev/null 2>&1 || { echo "Tilt is required for live development. Install from https://tilt.dev"; exit 1; }
	tilt up

auth-migrate: ## Run Better Auth migrations against live database
	@echo "==> Running Better Auth migration..."
	cd services/web && DATABASE_URL="postgres://postgres:postgres@localhost:5433/kizen?sslmode=disable" bun x @better-auth/cli migrate

generate: generate-sql generate-api generate-web ## Run all code-generators across services

generate-sql: ## Compile SQL queries with SQLC
	cd services/api && sqlc generate

generate-api: ## Generate Go HTTP server from OpenAPI contract
	cd services/api && go generate ./...

generate-web: ## Generate TypeScript client from OpenAPI contract
	cd services/web && bun run codegen
