import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { NotFoundComponent } from "./components/not-found";
import { routeTree } from "./routeTree.gen";
import "./lib/api";

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: NotFoundComponent,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}

declare module "@tanstack/react-start" {
	interface Register {
		ssr: true;
		router: Awaited<ReturnType<typeof getRouter>>;
	}
}
