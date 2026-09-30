import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { username } from "better-auth/plugins/username";
import { tanstackStartCookies } from "better-auth/tanstack-start";

const connectionString =
	process.env.DATABASE_URL ||
	`postgresql://${process.env.POSTGRES_USER || "postgres"}:${process.env.POSTGRES_PASSWORD || "postgres"}@${process.env.POSTGRES_HOST || "localhost"}:${process.env.POSTGRES_PORT || "5432"}/${process.env.POSTGRES_DB || "kizen"}`;

const pool = new Pool({
	connectionString,
});

export const auth = betterAuth({
	database: pool,
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		ipAddress: {
			ipAddressHeaders: ["x-forwarded-for"],
		},
	},
	// Plugins: username plugin adds username support, jwt provides microservice tokens, tanstackStartCookies manages SSR session cookies
	plugins: [username(), jwt(), tanstackStartCookies()],
});
