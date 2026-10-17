import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const BEARER_TOKEN_KEY = "bearer_token";

export const authClient = createAuthClient({
	plugins: [usernameClient()],
	fetchOptions: {
		auth: {
			type: "Bearer",
			token: () => {
				if (typeof window === "undefined") return "";
				return localStorage.getItem(BEARER_TOKEN_KEY) || "";
			},
		},
		onSuccess: (ctx) => {
			if (typeof window === "undefined") return;
			// Better Auth's Bearer plugin returns the token via the set-auth-token header
			const authToken = ctx.response.headers.get("set-auth-token");
			if (authToken) {
				localStorage.setItem(BEARER_TOKEN_KEY, authToken);
			}
		},
		onError: (ctx) => {
			if (typeof window === "undefined") return;
			// Clear token on 401 Unauthorized
			if (ctx.response.status === 401) {
				localStorage.removeItem(BEARER_TOKEN_KEY);
			}
		},
	},
});
