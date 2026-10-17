import { getMigrations } from "better-auth/db/migration";
import { auth } from "./auth";

async function run() {
	console.log(
		"[Better-Auth] Connecting to auth database and checking migrations...",
	);
	try {
		const { toBeCreated, runMigrations } = await getMigrations(auth.options);
		if (toBeCreated && toBeCreated.length > 0) {
			console.log(
				`[Better-Auth] Tables to create: ${toBeCreated.map((t) => t.table).join(", ")}`,
			);
			await runMigrations();
			console.log("[Better-Auth] Migrations applied successfully!");
		} else {
			console.log("[Better-Auth] Schema is up to date. No migrations needed.");
		}
	} catch (err) {
		console.error("[Better-Auth] Migration failed:", err);
		process.exit(1);
	}
}

run()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error("[Better-Auth] Fatal error during migration:", err);
		process.exit(1);
	});
