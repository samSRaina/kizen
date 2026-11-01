import { authClient } from "#/lib/auth-client";

export default function BetterAuthHeader() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <span>Loading…</span>;
	}

	if (session?.user) {
		return (
			<span>
				Logged in as {session.user.name || session.user.email}{" "}
				<button
					type="button"
					onClick={() => {
						void authClient.signOut();
					}}
				>
					Sign out
				</button>
			</span>
		);
	}

	return null;
}
