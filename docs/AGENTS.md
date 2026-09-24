# Agent Interoperability Protocol (AIP)

Kizen is built inherently as a **multiplayer environment** targeting the fusion of human developers and Autonomous AI Agents (e.g., Manus, Claude Opus, GPT-4). We do not just build a tool for humans; we build a runtime context for AI.

## 1. Native Agent Endpoints

AI Integrations are mapped as native workspace citizens. Every Agent deployed into Kizen connects through two core lifecycles:

### A. The Action Contract (OpenAPI)
Because Kizen is contract-first (`api/openapi.yaml`), Agents operate upon exactly the same rigorous definitions as our frontend. 
- Structurally predictable output: `application/problem+json` standard error boundaries natively parseable by LLMs.
- Strict typing on API operations, allowing AI function-calling schemas to be algorithmically generated directly from Kizen's repository state.

### B. The Telemetry Loop
Because Agents operate effectively by observing state, Kizen embeds strict telemetry natively.
- **Collector Endpoint:** `/__manus__/logs` and `/__manus__/debug-collector.js` in execution paths allow agents to transparently intercept DOM interactions, Network trace requests, and Session relays locally against the codebase natively via Vite middleware plugins.
- **Result:** The Agent does not blindly apply code adjustments; it observes real browser execution environments instantly.

## 2. Managing Agents in the Workspace

**Agent Service Architecture:**
Within the Kizen Workspace domain, Agents receive first-class identities (Service Accounts).
- `Agent Role`: Read/Write policies mapped directly to the `project` or `workspace` level.
- `Workspace Threading`: Instead of external chat contexts, human-to-agent delegaton flows inside the core Sprint Board interface.

### Example Agentic Flow: "Ticket Triage"
1. **Trigger**: Human assigns ticket `ZED-241: Add keyboard shortcut map` to AI Agent.
2. **Context Assembly**: Kizen API provides the Agent with a compressed, system-instruction-ready representation of the Codebase + recent `pgx` migration rules.
3. **Drafting Phase**: Agent creates a backend PR; Kizen executes local `Vitest` and `go test ./...`.
4. **Telemetry Injection**: Agent parses logs delivered through Kizen's local `/api/tickets/{id}/streamdown` implementation. 
5. **Resolution**: Ticket transistioned to `In Review`. 

## 3. Storage Proxies

For runtime debugging and external storage logic, Kizen wraps storage via internal middlewares (e.g., the `manus-storage-proxy` inside Vite). Agents can directly request presigned URLs to deposit artifacts, memory banks, or compiled graphs. 
