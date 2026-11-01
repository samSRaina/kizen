import type { components } from "#/lib/api-types.gen";

// Workspace Types
export type Workspace = components["schemas"]["Workspace"];
export type CreateWorkspaceRequest =
	components["schemas"]["CreateWorkspaceRequest"];
export type UpdateWorkspaceRequest =
	components["schemas"]["UpdateWorkspaceRequest"];

// Ticket Types
export type Ticket = components["schemas"]["Ticket"];
export type CreateTicketRequest = components["schemas"]["CreateTicketRequest"];
export type UpdateTicketRequest = components["schemas"]["UpdateTicketRequest"];
export type TicketStatus = components["schemas"]["TicketStatus"];
export type TicketPriority = components["schemas"]["TicketPriority"];
export type TicketType = components["schemas"]["TicketType"];

// Time Entry Types
export type TimeEntry = components["schemas"]["TimeEntry"];
export type CreateTimeEntryRequest =
	components["schemas"]["CreateTimeEntryRequest"];
export type UpdateTimeEntryRequest =
	components["schemas"]["UpdateTimeEntryRequest"];

// Error Shape
export type ProblemDetail = components["schemas"]["ProblemDetail"];
