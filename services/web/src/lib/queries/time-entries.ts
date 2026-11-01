import { queryOptions } from "@tanstack/react-query";
import { api } from "#/lib/goapi-client";
import type {
	CreateTimeEntryRequest,
	TimeEntry,
	UpdateTimeEntryRequest,
} from "#/lib/types";

export const timeEntryKeys = {
	all: ["time-entries"] as const,
	lists: (workspaceId: string, ticketId?: string) =>
		[...timeEntryKeys.all, "list", workspaceId, ticketId ?? "all"] as const,
	details: (workspaceId: string) =>
		[...timeEntryKeys.all, "detail", workspaceId] as const,
	detail: (workspaceId: string, id: string) =>
		[...timeEntryKeys.details(workspaceId), id] as const,
};

export const timeEntryQueries = {
	list: (workspaceId: string, ticketId?: string) =>
		queryOptions({
			queryKey: timeEntryKeys.lists(workspaceId, ticketId),
			queryFn: async (): Promise<TimeEntry[]> => {
				const { data, error } = await api.GET(
					"/workspaces/{workspace_id}/time-entries",
					{
						params: {
							path: { workspace_id: workspaceId },
							query: ticketId ? { ticket_id: ticketId } : undefined,
						},
					},
				);
				if (error) {
					const message =
						typeof error === "object" && error && "detail" in error
							? (error as { detail?: string }).detail
							: "Failed to load time entries";
					throw new Error(message || "Failed to load time entries");
				}
				return data ?? [];
			},
			staleTime: 1000 * 15,
			enabled: typeof window !== "undefined" && Boolean(workspaceId),
		}),
};

export const timeEntryMutations = {
	create: async (
		workspaceId: string,
		body: CreateTimeEntryRequest,
	): Promise<TimeEntry> => {
		const { data, error } = await api.POST(
			"/workspaces/{workspace_id}/time-entries",
			{
				params: { path: { workspace_id: workspaceId } },
				body,
			},
		);
		if (error) {
			const message =
				typeof error === "object" && error && "detail" in error
					? (error as { detail?: string }).detail
					: "Failed to create time entry";
			throw new Error(message || "Failed to create time entry");
		}
		if (!data) throw new Error("No data returned from create time entry");
		return data;
	},

	update: async (
		workspaceId: string,
		id: string,
		body: UpdateTimeEntryRequest,
	): Promise<TimeEntry> => {
		const { data, error } = await api.PATCH(
			"/workspaces/{workspace_id}/time-entries/{id}",
			{
				params: { path: { workspace_id: workspaceId, id } },
				body,
			},
		);
		if (error) {
			const message =
				typeof error === "object" && error && "detail" in error
					? (error as { detail?: string }).detail
					: "Failed to update time entry";
			throw new Error(message || "Failed to update time entry");
		}
		if (!data) throw new Error("No data returned from update time entry");
		return data;
	},

	stop: async (workspaceId: string, id: string): Promise<TimeEntry> => {
		const { data, error } = await api.POST(
			"/workspaces/{workspace_id}/time-entries/{id}/stop",
			{
				params: { path: { workspace_id: workspaceId, id } },
			},
		);
		if (error) {
			const message =
				typeof error === "object" && error && "detail" in error
					? (error as { detail?: string }).detail
					: "Failed to stop time entry";
			throw new Error(message || "Failed to stop time entry");
		}
		if (!data) throw new Error("No data returned from stop time entry");
		return data;
	},

	delete: async (workspaceId: string, id: string): Promise<void> => {
		const { error } = await api.DELETE(
			"/workspaces/{workspace_id}/time-entries/{id}",
			{
				params: { path: { workspace_id: workspaceId, id } },
			},
		);
		if (error) {
			const message =
				typeof error === "object" && error && "detail" in error
					? (error as { detail?: string }).detail
					: "Failed to delete time entry";
			throw new Error(message || "Failed to delete time entry");
		}
	},
};
