import { getMigrations } from "better-auth/db/migration";
import { auth } from "./auth";

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
	const maxRetries = 10;
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			console.log(
				`[Better Auth] Checking database migrations (attempt ${attempt}/${maxRetries})...`,
			);
			const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(
				auth.options,
			);

			if (toBeCreated.length > 0 || toBeAdded.length > 0) {
				console.log(
					`[Better Auth] Applying migrations: ${toBeCreated.length} tables to create, ${toBeAdded.length} fields to add...`,
				);
				await runMigrations();
				console.log("[Better Auth] Migrations applied successfully.");
			} else {
				console.log("[Better Auth] Database schema is up to date.");
			}
			process.exit(0);
		} catch (err) {
			console.warn(`[Better Auth] Migration attempt ${attempt} failed:`, err);
			if (attempt === maxRetries) {
				console.error("[Better Auth] All migration attempts exhausted.");
				process.exit(1);
			}
			await sleep(1500);
		}
	}
}

run();
