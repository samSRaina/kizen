import { createFileRoute, redirect } from "@tanstack/react-router";
import { authQueries } from "#/lib/queries/auth";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.query(authQueries.session());
		if (session?.user) {
			throw redirect({ to: "/workspaces" });
		}
		throw redirect({ to: "/authenticate" });
	},
});
