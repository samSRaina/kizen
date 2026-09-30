import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth-server";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) {
			throw redirect({
				to: "/",
			});
		}
		return { session };
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	return <Outlet />;
}
