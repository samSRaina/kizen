import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { username } from "better-auth/plugins/username";
import { tanstackStartCookies } from "better-auth/tanstack-start";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
	connectionString,
});

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
	database: pool,
	rateLimit: {
		enabled: true,
		window: 10,
		max: 100,
		customRules: {
			"/api/auth/sign-in/email": { window: 60, max: 5 },
			"/api/auth/sign-up/email": { window: 60, max: 3 },
		},
	},
    // Security: Prevents cross-site request forgery and hijacking by strictly verifying origin
	trustedOrigins: [
		process.env.BETTER_AUTH_URL || "http://localhost:3000",
		"http://localhost:5173", // Vite default dev server
		"http://localhost:8082"  // Go backend proxy edge-case
	],
	emailAndPassword: {
		enabled: true,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 24 hours
		cookieCache: {
			enabled: true,
			maxAge: 300,
			strategy: "compact", // Compact Base64url + HMAC
		},
	},
	advanced: {
		useSecureCookies: isProd, // Restrict to HTTPS in prod
		defaultCookieAttributes: {
			sameSite: "lax",
		},
		ipAddress: {
			ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
		},
	},
	// Plugins: username plugin adds username support, jwt provides microservice tokens, tanstackStartCookies manages SSR session cookies
	plugins: [username(), jwt(), tanstackStartCookies()],
});
