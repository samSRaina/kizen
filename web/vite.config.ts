import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
	server: {
		proxy: {
			"/api/v1": {
				target: process.env.WORKSPACE_SERVICE_URL || "http://localhost:8082",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/v1/, ""),
			},
		},
	},
	ssr: { external: ["bun:sqlite"] },
	optimizeDeps: { exclude: ["bun:sqlite"] },
});

export default config;
