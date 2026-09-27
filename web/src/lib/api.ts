import { authClient } from "@/lib/auth-client";

export type Workspace = {
	id: string;
	owner_id: string;
	name: string;
	default_hourly_rate: number;
	description?: string | null;
	created_at: string;
	updated_at: string;
};

export type CreateWorkspaceInput = {
	name: string;
	default_hourly_rate?: number;
	description?: string | null;
};

export async function apiFetch(url: string, options: RequestInit = {}) {
	const { data } = await authClient.token();

	const headers = new Headers(options.headers);
	if (data?.token) {
		headers.set("Authorization", `Bearer ${data.token}`);
	}

	return fetch(url, {
		...options,
		headers,
	});
}

export async function listWorkspaces(): Promise<Workspace[]> {
	const res = await apiFetch("/api/v1/workspaces");
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(
			err.detail || err.title || `Failed to list workspaces (${res.status})`,
		);
	}
	return res.json();
}

export async function createWorkspace(
	input: CreateWorkspaceInput,
): Promise<Workspace> {
	const res = await apiFetch("/api/v1/workspaces", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: input.name.trim(),
			default_hourly_rate: Number(input.default_hourly_rate) || 0,
			description: input.description?.trim() ? input.description.trim() : null,
		}),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(
			err.detail || err.title || `Failed to create workspace (${res.status})`,
		);
	}
	return res.json();
}

export async function deleteWorkspace(id: string): Promise<void> {
	const res = await apiFetch(`/api/v1/workspaces/${id}`, {
		method: "DELETE",
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(
			err.detail || err.title || `Failed to delete workspace (${res.status})`,
		);
	}
}
