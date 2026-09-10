import { components } from "../types/api";

export type Workspace = components["schemas"]["Workspace"];
export type CreateWorkspaceRequest = components["schemas"]["CreateWorkspaceRequest"];
export type ProblemDetail = components["schemas"]["ProblemDetail"];

export interface Ticket {
  id: string;
  key: string;
  workspaceId: string;
  title: string;
  description: string;
  status: "backlog" | "in_progress" | "review" | "done";
  priority: "urgent" | "high" | "medium" | "low";
  hoursLogged: number;
  estimatedHours: number;
  tags: string[];
  updatedAt: string;
}

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: "ws-acme-891a",
    name: "Acme FinTech & Payments",
    default_hourly_rate: 165,
    description: "Multi-tenant ledger sync, PCI-DSS compliance & Stripe webhook idempotency engine.",
    created_at: "2026-02-14T09:30:00Z",
    updated_at: "2026-09-08T16:45:00Z",
  },
  {
    id: "ws-hyper-442c",
    name: "HyperScale Cloud SaaS",
    default_hourly_rate: 145,
    description: "Async event pipeline, AWS Lambda cold-start latency tuning and edge telemetry.",
    created_at: "2026-04-10T11:20:00Z",
    updated_at: "2026-09-09T18:10:00Z",
  },
  {
    id: "ws-nexus-908f",
    name: "Nexus HealthTech",
    default_hourly_rate: 180,
    description: "HIPAA encrypted storage, patient record migration & HL7 FHIR gateway service.",
    created_at: "2026-06-01T14:00:00Z",
    updated_at: "2026-09-10T07:22:00Z",
  },
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "tk-101",
    key: "ACM-104",
    workspaceId: "ws-acme-891a",
    title: "Implement Redis distributed lock for payout webhook reconciliation",
    description: "Prevent duplicate ledger entries during burst webhook deliveries by locking on idempotency keys.",
    status: "in_progress",
    priority: "urgent",
    hoursLogged: 4.5,
    estimatedHours: 6.0,
    tags: ["Ledger", "Redis", "Security"],
    updatedAt: "12m ago",
  },
  {
    id: "tk-102",
    key: "ACM-105",
    workspaceId: "ws-acme-891a",
    title: "PostgreSQL schema migration: Partition audit_logs table by month",
    description: "Prepare zero-downtime pg_partman migration for 45M rows audit table.",
    status: "review",
    priority: "high",
    hoursLogged: 7.25,
    estimatedHours: 8.0,
    tags: ["Postgres", "DBA"],
    updatedAt: "1h ago",
  },
  {
    id: "tk-103",
    key: "ACM-106",
    workspaceId: "ws-acme-891a",
    title: "Export monthly billable breakdown to CSV & PDF invoice format",
    description: "Format hours logged against milestone deliverables with tax calculations.",
    status: "backlog",
    priority: "medium",
    hoursLogged: 0,
    estimatedHours: 3.5,
    tags: ["Billing", "Exports"],
    updatedAt: "1d ago",
  },
  {
    id: "tk-104",
    key: "ACM-102",
    workspaceId: "ws-acme-891a",
    title: "Single sign-on SAML 2.0 integration for enterprise client portal",
    description: "Completed Okta and Microsoft Entra ID verification with signed assertion claims.",
    status: "done",
    priority: "high",
    hoursLogged: 12.0,
    estimatedHours: 12.0,
    tags: ["Auth", "SAML"],
    updatedAt: "2d ago",
  },
  // HyperScale SaaS tickets
  {
    id: "tk-201",
    key: "HYP-31",
    workspaceId: "ws-hyper-442c",
    title: "Optimize Go microservice binary size & Alpine container cold boots",
    description: "Stripped debug symbols and enabled LTO to drop binary from 72MB to 14MB.",
    status: "in_progress",
    priority: "high",
    hoursLogged: 3.75,
    estimatedHours: 5.0,
    tags: ["Go", "Docker", "Perf"],
    updatedAt: "45m ago",
  },
  {
    id: "tk-202",
    key: "HYP-32",
    workspaceId: "ws-hyper-442c",
    title: "Kafka consumer group lag alert telemetry in Grafana",
    description: "Configure Prometheus metrics exporter and dead-letter queue re-drive UI.",
    status: "done",
    priority: "medium",
    hoursLogged: 5.5,
    estimatedHours: 6.0,
    tags: ["Kafka", "Observability"],
    updatedAt: "3d ago",
  },
  // Nexus HealthTech tickets
  {
    id: "tk-301",
    key: "NEX-88",
    workspaceId: "ws-nexus-908f",
    title: "Implement AES-256 GCM client-side envelope encryption for FHIR JSON payloads",
    description: "KMS root key rotation protocol and authenticated header verification.",
    status: "in_progress",
    priority: "urgent",
    hoursLogged: 6.0,
    estimatedHours: 8.0,
    tags: ["Security", "FHIR", "Crypto"],
    updatedAt: "20m ago",
  },
];
