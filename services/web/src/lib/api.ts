import { client } from "@/lib/api-client/client.gen";
import { BEARER_TOKEN_KEY } from "@/lib/auth-client";

// Configure baseURL
client.setConfig({
	baseUrl: "http://localhost:8080/api/v1",
});

// Interceptor automatically injects your Better Auth Bearer token
client.interceptors.request.use((request) => {
	if (typeof window !== "undefined") {
		const token = localStorage.getItem(BEARER_TOKEN_KEY);
		if (token) {
			request.headers.set("Authorization", `Bearer ${token}`);
		}
	}
	return request;
});
