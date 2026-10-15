import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { fetchSession } from "@/lib/auth-session";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async () => {
		let session = await fetchSession();
		if (!session && typeof window !== "undefined") {
			const clientSession = await authClient.getSession();
			if (clientSession.data) {
				session = clientSession.data;
			}
		}

		if (!session?.user) {
			throw redirect({
				to: "/authenticate",
			});
		}

		return { session };
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	return <Outlet />;
}
