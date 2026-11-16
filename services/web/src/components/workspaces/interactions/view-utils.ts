import type { Ticket, TicketStatus } from "@/lib/types";

export interface ColumnGroupDef {
	id: TicketStatus;
	title: string;
	dotColor: string;
}

export const DEFAULT_COLUMNS: ColumnGroupDef[] = [
	{ id: "backlog", title: "Backlog", dotColor: "#94a3b8" },
	{ id: "todo", title: "To Do", dotColor: "#60a5fa" },
	{ id: "progress", title: "In Progress", dotColor: "#f59e0b" },
	{ id: "review", title: "In Review", dotColor: "#a855f7" },
];

export const ALL_STATUSES: TicketStatus[] = [
	"backlog",
	"todo",
	"progress",
	"review",
	"done",
];

export function getStatusLabel(status: TicketStatus): string {
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

export function filterTickets(
	tickets: Ticket[],
	search: string,
	statusFilter: string,
): Ticket[] {
	const query = search.trim().toLowerCase();
	return tickets.filter((t) => {
		const matchesSearch =
			!query ||
			t.title.toLowerCase().includes(query) ||
			t.identifier.toLowerCase().includes(query) ||
			Boolean(t.description?.toLowerCase().includes(query));

		const matchesStatus =
			statusFilter === "all" ? true : t.status === statusFilter;

		return matchesSearch && matchesStatus;
	});
}
