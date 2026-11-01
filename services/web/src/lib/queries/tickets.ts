import { queryOptions } from "@tanstack/react-query";
import { api } from "#/lib/goapi-client";
import type {
	CreateTicketRequest,
	Ticket,
	UpdateTicketRequest,
} from "#/lib/types";

export const ticketKeys = {
	all: ["tickets"] as const,
	lists: (workspaceId: string) =>
		[...ticketKeys.all, "list", workspaceId] as const,
	details: (workspaceId: string) =>
		[...ticketKeys.all, "detail", workspaceId] as const,
	detail: (workspaceId: string, identifier: string) =>
		[...ticketKeys.details(workspaceId), identifier] as const,
};

export const ticketQueries = {
	list: (workspaceId: string) =>
		queryOptions({
			queryKey: ticketKeys.lists(workspaceId),
			queryFn: async (): Promise<Ticket[]> => {
				const { data, error } = await api.GET(
					"/workspaces/{workspace_id}/tickets",
					{
						params: { path: { workspace_id: workspaceId } },
					},
				);
				if (error) {
					const message =
						typeof error === "object" && error && "detail" in error
							? (error as { detail?: string }).detail
							: "Failed to load tickets";
					throw new Error(message || "Failed to load tickets");
				}
				return data ?? [];
			},
			staleTime: 1000 * 30,
			enabled: typeof window !== "undefined" && Boolean(workspaceId),
		}),

	detail: (workspaceId: string, identifier: string) =>
		queryOptions({
			queryKey: ticketKeys.detail(workspaceId, identifier),
			queryFn: async (): Promise<Ticket> => {
				const { data, error } = await api.GET(
					"/workspaces/{workspace_id}/tickets/{identifier}",
					{
						params: { path: { workspace_id: workspaceId, identifier } },
					},
				);
				if (error) {
					const message =
						typeof error === "object" && error && "detail" in error
							? (error as { detail?: string }).detail
							: "Failed to load ticket";
					throw new Error(message || "Failed to load ticket");
				}
				if (!data) throw new Error("Ticket not found");
				return data;
			},
			staleTime: 1000 * 30,
			enabled:
				typeof window !== "undefined" && Boolean(workspaceId && identifier),
		}),
};

export const ticketMutations = {
	create: async (
		workspaceId: string,
		body: CreateTicketRequest,
	): Promise<Ticket> => {
		const { data, error } = await api.POST(
			"/workspaces/{workspace_id}/tickets",
			{
				params: { path: { workspace_id: workspaceId } },
				body,
			},
		);
		if (error) {
			const message =
				typeof error === "object" && error && "detail" in error
					? (error as { detail?: string }).detail
					: "Failed to create ticket";
			throw new Error(message || "Failed to create ticket");
		}
		if (!data) throw new Error("No data returned from create ticket");
		return data;
	},

	update: async (
		workspaceId: string,
		identifier: string,
		body: UpdateTicketRequest,
	): Promise<Ticket> => {
		const { data, error } = await api.PATCH(
			"/workspaces/{workspace_id}/tickets/{identifier}",
			{
				params: { path: { workspace_id: workspaceId, identifier } },
				body,
			},
		);
		if (error) {
			const message =
				typeof error === "object" && error && "detail" in error
					? (error as { detail?: string }).detail
					: "Failed to update ticket";
			throw new Error(message || "Failed to update ticket");
		}
		if (!data) throw new Error("No data returned from update ticket");
		return data;
	},

	delete: async (workspaceId: string, identifier: string): Promise<void> => {
		const { error } = await api.DELETE(
			"/workspaces/{workspace_id}/tickets/{identifier}",
			{
				params: { path: { workspace_id: workspaceId, identifier } },
			},
		);
		if (error) {
			const message =
				typeof error === "object" && error && "detail" in error
					? (error as { detail?: string }).detail
					: "Failed to delete ticket";
			throw new Error(message || "Failed to delete ticket");
		}
	},
};
