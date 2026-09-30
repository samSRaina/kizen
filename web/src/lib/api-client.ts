import createClient from "openapi-fetch";
import { authClient } from "@/lib/auth-client";
import type { paths } from "@/types/api.gen";

// Create the type-safe client connected to the API
export const apiClient = createClient<paths>({
	baseUrl: "", // Uses the relative URL which will hit the vite proxy or traefik
});

// Configure interceptor to attach bearer token to all requests
apiClient.use({
	async onRequest({ request }) {
		const { data } = await authClient.token();
		if (data?.token) {
			request.headers.set("Authorization", `Bearer ${data.token}`);
		}
		return request;
	},
});
