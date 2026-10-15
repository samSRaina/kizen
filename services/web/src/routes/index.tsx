import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { fetchSession } from "@/lib/auth-session";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		let session = await fetchSession();
		if (!session && typeof window !== "undefined") {
			const clientSession = await authClient.getSession();
			if (clientSession.data) {
				session = clientSession.data;
			}
		}

		if (session?.user) {
			throw redirect({ to: "/home" });
		}
		throw redirect({ to: "/authenticate" });
	},
});
