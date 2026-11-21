/**
 * Core domain types for Kizen
 * Conforms to contracts/openapi.yaml
 */

export interface Workspace {
	id: string;
	owner_id: string;
	name: string;
	default_hourly_rate: number;
	description?: string | null;
	category?: string;
	created_at: string;
	updated_at: string;
}

export interface Project {
	id: string;
	workspace_id: string;
	name: string;
	ticket_id_prefix: string;
	settings: Record<string, unknown>;
	default_hourly_rate: number;
	description?: string | null;
	category?: string;
	created_at: string;
	updated_at: string;
}

export type TicketStatus =
	| "backlog"
	| "todo"
	| "progress"
	| "paused"
	| "review"
	| "done";
export type TicketPriority =
	| "Highest"
	| "High"
	| "Medium"
	| "Low"
	| "Lowest"
	| "Critical";
export type TicketType = "feature" | "bug" | "task";

export interface Ticket {
	id: string;
	project_id: string;
	identifier: string;
	title: string;
	description?: string | null;
	type: TicketType;
	status: TicketStatus;
	priority: TicketPriority;
	points?: number;
	category?: string;
	tags?: string[];
	created_at: string;
	updated_at: string;
}

export type TimerState = "running" | "paused" | "stopped";

export interface Track {
	id: string;
	workspace_id: string;
	ticket_id?: string | null;
	description?: string | null;
	started_at: string;
	ended_at?: string | null;
	duration_seconds?: number | null;
	billable: boolean;
	hourly_rate: number;
	is_manual?: boolean;
	timer_state: TimerState;
	created_at: string;
	updated_at: string;
}
