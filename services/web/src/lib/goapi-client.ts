import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "#/lib/api-types.gen";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let cachedJwt: { token: string; expiresAt: number } | null = null;

export async function getAuthToken(): Promise<string | null> {
	if (typeof window === "undefined") {
		return null;
	}

	if (cachedJwt && cachedJwt.expiresAt > Date.now()) {
		return cachedJwt.token;
	}

	try {
		const res = await fetch("/api/auth/token", {
			method: "GET",
			credentials: "include",
		});
		if (!res.ok) return null;
		const data = (await res.json()) as { token?: string };
		if (data?.token) {
			// Cache token for 4 minutes
			cachedJwt = {
				token: data.token,
				expiresAt: Date.now() + 4 * 60 * 1000,
			};
			return data.token;
		}
	} catch {
		// Ignore failure
	}

	return null;
}

export function clearCachedAuthToken(): void {
	cachedJwt = null;
}

// Middleware to inject Better-Auth JWT into every Go API request
const authMiddleware: Middleware = {
	async onRequest({ request }) {
		const token = await getAuthToken();
		if (token) {
			request.headers.set("Authorization", `Bearer ${token}`);
		}
		return request;
	},
};

// Export the typed client
export const api = createClient<paths>({
	baseUrl: API_BASE_URL,
});

api.use(authMiddleware);
