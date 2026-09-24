import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

const db = new Database(".kizen-auth.db");

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	database: db,
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	advanced: {
		useSecureCookies: process.env.NODE_ENV === "production",
	},
	trustedOrigins: ["http://localhost:3000"],
});
