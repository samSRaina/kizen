import { Database } from "bun:sqlite";
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

const dbPath = process.env.AUTH_DATABASE_PATH || "auth.db";

const hasGithubOAuth = Boolean(
	process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
);

export const auth = betterAuth({
	database: new Database(dbPath),
	socialProviders: {
		...(hasGithubOAuth
			? {
					github: {
						clientId: process.env.GITHUB_CLIENT_ID as string,
						clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
					},
				}
			: {}),
	},
	advanced: {
		ipAddress: {
			ipAddressHeaders: ["x-forwarded-for"],
		},
	},
	// Cookie integration plugin "tanstack-start-cookies" must be placed last
	plugins: [jwt(), tanstackStartCookies()],
});
