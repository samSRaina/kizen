import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "#/components/layout/app-shell";
import { authQueries } from "#/lib/queries/auth";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.query(authQueries.session());
		if (!session?.user) {
			throw redirect({ to: "/authenticate" });
		}
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	return (
		<AppShell>
			<Outlet />
		</AppShell>
	);
}
