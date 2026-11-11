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
