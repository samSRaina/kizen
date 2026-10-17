import { client } from "@/lib/api-client/client.gen";
import { BEARER_TOKEN_KEY } from "@/lib/auth-client";

// Configure baseURL dynamically:
// In the browser, Traefik routes `/api/v1` to the Go backend on :80.
// On the server (SSR), reach the api container via internal docker network.
client.setConfig({
	baseUrl:
		typeof window !== "undefined"
			? `${window.location.origin}/api/v1`
			: "http://api:8080/api/v1",
});

// Interceptor automatically injects your Better Auth Bearer token
client.interceptors.request.use((request) => {
	if (typeof window !== "undefined") {
		const token = localStorage.getItem(BEARER_TOKEN_KEY) || "dev-token";
		request.headers.set("Authorization", `Bearer ${token}`);
	}
	return request;
});
