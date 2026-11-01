import { queryOptions } from "@tanstack/react-query";
import { api } from "#/lib/goapi-client";
import type {
	CreateWorkspaceRequest,
	UpdateWorkspaceRequest,
	Workspace,
} from "#/lib/types";

export const workspaceKeys = {
	all: ["workspaces"] as const,
	lists: (userId?: string) =>
		userId
			? ([...workspaceKeys.all, "list", userId] as const)
			: ([...workspaceKeys.all, "list"] as const),
	details: () => [...workspaceKeys.all, "detail"] as const,
	detail: (id: string) => [...workspaceKeys.details(), id] as const,
};

export const workspaceQueries = {
	list: (userId?: string) =>
		queryOptions({
			queryKey: workspaceKeys.lists(userId),
			queryFn: async (): Promise<Workspace[]> => {
				const { data, error } = await api.GET("/workspaces");
				if (error) {
					const message =
						typeof error === "object" && error && "detail" in error
							? (error as { detail?: string }).detail
							: "Failed to load workspaces";
					throw new Error(message || "Failed to load workspaces");
				}
				return data ?? [];
			},
			staleTime: 1000 * 60,
			enabled: typeof window !== "undefined",
		}),

	detail: (id: string) =>
		queryOptions({
			queryKey: workspaceKeys.detail(id),
			queryFn: async (): Promise<Workspace> => {
				const { data, error } = await api.GET("/workspaces/{id}", {
					params: { path: { id } },
				});
				if (error) {
					const message =
						typeof error === "object" && error && "detail" in error
							? (error as { detail?: string }).detail
							: "Failed to load workspace";
					throw new Error(message || "Failed to load workspace");
				}
				if (!data) throw new Error("Workspace not found");
				return data;
			},
			staleTime: 1000 * 60,
			enabled: typeof window !== "undefined" && Boolean(id),
		}),
};

export const workspaceMutations = {
	create: async (body: CreateWorkspaceRequest): Promise<Workspace> => {
		const { data, error } = await api.POST("/workspaces", {
			body,
		});
		if (error) {
			const message =
				typeof error === "object" && error && "detail" in error
					? (error as { detail?: string }).detail
					: "Failed to create workspace";
			throw new Error(message || "Failed to create workspace");
		}
		if (!data) throw new Error("No data returned from create workspace");
		return data;
	},

	update: async (
		id: string,
		body: UpdateWorkspaceRequest,
	): Promise<Workspace> => {
		const { data, error } = await api.PATCH("/workspaces/{id}", {
			params: { path: { id } },
			body,
		});
		if (error) {
			const message =
				typeof error === "object" && error && "detail" in error
					? (error as { detail?: string }).detail
					: "Failed to update workspace";
			throw new Error(message || "Failed to update workspace");
		}
		if (!data) throw new Error("No data returned from update workspace");
		return data;
	},

	delete: async (id: string): Promise<void> => {
		const { error } = await api.DELETE("/workspaces/{id}", {
			params: { path: { id } },
		});
		if (error) {
			const message =
				typeof error === "object" && error && "detail" in error
					? (error as { detail?: string }).detail
					: "Failed to delete workspace";
			throw new Error(message || "Failed to delete workspace");
		}
	},
};
