import { betterAuth } from "better-auth";
import { jwt, username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";

export const auth = betterAuth({
	database: new Pool({
		connectionString:
			process.env.DATABASE_URL ||
			"postgres://postgres:postgres@localhost:5432/kizen_auth?sslmode=disable",
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [tanstackStartCookies(), username(), jwt()],
});
