import { betterAuth } from "better-auth";
import { bearer, username } from "better-auth/plugins";
import { Pool } from "pg";

export const auth = betterAuth({
	database: new Pool({
		connectionString: process.env.DATABASE_URL,
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [username(), bearer()],
});
