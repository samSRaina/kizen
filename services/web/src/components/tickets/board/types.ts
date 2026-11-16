import type { TicketStatus } from "#/lib/types";

export interface TicketColumnDef {
	key: TicketStatus;
	label: string;
	color: string;
	borderAccent: string;
	dotColor: string;
}

export const TICKET_COLUMNS: TicketColumnDef[] = [
	{
		key: "backlog",
		label: "BACKLOG",
		color: "text-neutral-400",
		borderAccent: "border-neutral-500/40",
		dotColor: "bg-neutral-400",
	},
	{
		key: "todo",
		label: "TO DO",
		color: "text-blue-400",
		borderAccent: "border-blue-500/40",
		dotColor: "bg-blue-400",
	},
	{
		key: "progress",
		label: "IN PROGRESS",
		color: "text-amber-400",
		borderAccent: "border-amber-500/40",
		dotColor: "bg-amber-400",
	},
	{
		key: "review",
		label: "IN REVIEW",
		color: "text-purple-400",
		borderAccent: "border-purple-500/40",
		dotColor: "bg-purple-400",
	},
];

export const ALL_STATUS_OPTIONS: {
	key: TicketStatus;
	label: string;
	dotColor: string;
}[] = [
	{ key: "backlog", label: "Backlog", dotColor: "bg-neutral-400" },
	{ key: "todo", label: "To Do", dotColor: "bg-blue-400" },
	{ key: "progress", label: "In Progress", dotColor: "bg-amber-400" },
	{ key: "review", label: "In Review", dotColor: "bg-purple-400" },
	{ key: "done", label: "Done (Finish)", dotColor: "bg-emerald-400" },
];

export function getStatusDisplayName(status: TicketStatus): string {
	switch (status) {
		case "backlog":
			return "Backlog";
		case "todo":
			return "To Do";
		case "progress":
			return "In Progress";
		case "review":
			return "In Review";
		case "done":
			return "Done";
		default:
			return status;
	}
}

export function validateTicketTransition(
	current: TicketStatus,
	next: TicketStatus,
): { allowed: boolean; reason?: string } {
	if (current === next) {
		return { allowed: true };
	}

	switch (current) {
		case "backlog":
			if (next === "todo" || next === "progress") {
				return { allowed: true };
			}
			return {
				allowed: false,
				reason: `Cannot move directly from Backlog to ${getStatusDisplayName(next)}. Move to To Do or In Progress first.`,
			};

		case "todo":
			if (next === "progress" || next === "backlog") {
				return { allowed: true };
			}
			return {
				allowed: false,
				reason: `Cannot move directly from To Do to ${getStatusDisplayName(next)}. Start work in In Progress first.`,
			};

		case "progress":
			if (next === "review" || next === "todo" || next === "backlog") {
				return { allowed: true };
			}
			return {
				allowed: false,
				reason:
					"Tickets In Progress must pass through In Review before completion.",
			};

		case "review":
			if (
				next === "done" ||
				next === "progress" ||
				next === "todo" ||
				next === "backlog"
			) {
				return { allowed: true };
			}
			return {
				allowed: false,
				reason: `Cannot move ticket from In Review to ${getStatusDisplayName(next)}.`,
			};

		case "done":
			if (next === "todo" || next === "progress" || next === "backlog") {
				return { allowed: true };
			}
			return {
				allowed: false,
				reason:
					"Completed tickets cannot be moved directly to In Review. Reopen to To Do or In Progress first.",
			};

		default:
			return { allowed: false, reason: `Unknown ticket status: ${current}` };
	}
}

export function canTransition(
	current: TicketStatus,
	next: TicketStatus,
): boolean {
	return validateTicketTransition(current, next).allowed;
}
