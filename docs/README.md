# Kizen Documentation Hub

Welcome to the internal engineering documentation for **Kizen**, the minimal, high-performance task master built for solo devs and hybrid human/AI teams.

> **Note**: For quick-start instructions, local setup, and repository contribution rules, please refer to the primary developer [readme.md](../readme.md) in the project root.

## Complete Documentation Index

### ⚙️ System Design & Architecture
* [**Architecture Overview**](./ARCHITECTURE.md) - Deep dive into Kizen's backend microservices (Go/chi), PostgreSQL data integrity constraints via `sqlc`, and modular boundary principles.
* **Component Mapping** - See our transition flows mapped to internal `/services` and API schemas logic.

### 🤖 Agentic Integrations
* [**Agent Interoperability Protocol (AIP)**](./AGENTS.md) - Understanding Kizen's foundational multiplayer AI vision. Detailed workflows covering how AI Agents authenticate, process OpenAPI contracts, and utilize the built-in Manus browser telemetry systems `/__manus__/logs`.

### 📚 API & Contracts
* **OpenAPI 3.1 Spec** - View the definitive schema source of truth at [`../api/openapi.yaml`](../api/openapi.yaml). 
* **Database Migrations** - Schema definitions and migrations are enforced strictly in [`../sql/migrations`](../sql/migrations).

## Development Core Tenets
1. **Speed & Stability First:** Go backends compiled natively ensures low resource tracking compared to Electron/Node-heavy alternatives.
2. **AI-Frictionless:** Every interface—whether an API payload or a React dashboard—is intended to be perfectly parsable by both a developer and an Autonomous Agent.
3. **Database as the Anchor:** We rely fully on PostgreSQL features (RLS scoping, ACID guarantees) and statically verified `sql` access. 

---
_These documents are tightly coupled to the active codebase and are continuously updated via automated tooling and agent workflows to reflect the real-time production layout of Kizen._
