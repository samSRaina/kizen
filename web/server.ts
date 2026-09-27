import { join } from "node:path";
import { getMigrations } from "better-auth/db/migration";
import handler from "./dist/server/server.js";
import { auth } from "./src/lib/auth.js";

// Run Better Auth migrations on SQLite if needed
try {
	const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options);
	if (toBeCreated.length > 0 || toBeAdded.length > 0) {
		console.log("[Better Auth] Applying database migrations...");
		await runMigrations();
		console.log("[Better Auth] Migrations applied successfully!");
	}
} catch (err) {
	console.error("[Better Auth] Migration check error:", err);
}

const CLIENT_DIR = "./dist/client";
const PORT = Number(process.env.PORT) || 3000;

Bun.serve({
	port: PORT,
	async fetch(req) {
		const url = new URL(req.url);

		// 1. Serve static files from dist/client if they exist
		if (url.pathname !== "/") {
			const filePath = join(CLIENT_DIR, url.pathname);
			const file = Bun.file(filePath);

			if (await file.exists()) {
				const headers = new Headers();
				if (url.pathname.startsWith("/assets/")) {
					headers.set("Cache-Control", "public, max-age=31536000, immutable");
				} else {
					headers.set("Cache-Control", "public, max-age=3600");
				}
				return new Response(file, { headers });
			}
		}

		// 2. Delegate all non-static requests to TanStack Start SSR
		return handler.fetch(req);
	},
});

console.log(`Web server listening on http://localhost:${PORT}`);
