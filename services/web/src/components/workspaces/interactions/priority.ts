import type { TicketPriority } from "@/lib/types";

export interface PriorityMeta {
	value: TicketPriority;
	label: string;
	badgeClass: string;
	dotColor: string;
}

export const PRIORITY_CONFIG: Record<TicketPriority, PriorityMeta> = {
	Critical: {
		value: "Critical",
		label: "Critical",
		badgeClass:
			"bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/25",
		dotColor: "#ef4444",
	},
	High: {
		value: "High",
		label: "High",
		badgeClass:
			"bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/25",
		dotColor: "#f97316",
	},
	Medium: {
		value: "Medium",
		label: "Medium",
		badgeClass:
			"bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25",
		dotColor: "#f59e0b",
	},
	Low: {
		value: "Low",
		label: "Low",
		badgeClass:
			"bg-surface-elevated text-text-secondary border border-border-subtle",
		dotColor: "#64748b",
	},
};

export const PRIORITY_LEVELS: PriorityMeta[] = [
	PRIORITY_CONFIG.Critical,
	PRIORITY_CONFIG.High,
	PRIORITY_CONFIG.Medium,
	PRIORITY_CONFIG.Low,
];

export function getPriorityMeta(priority?: TicketPriority): PriorityMeta {
	if (!priority || !PRIORITY_CONFIG[priority]) {
		return PRIORITY_CONFIG.Low;
	}
	return PRIORITY_CONFIG[priority];
}
