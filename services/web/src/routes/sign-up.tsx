import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-up")({
	beforeLoad: () => {
		throw redirect({
			to: "/authenticate",
			search: { mode: "sign-up" },
		});
	},
});
