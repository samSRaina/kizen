import { authClient } from "@/lib/auth-client";

export function HeaderUser() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="h-9 w-24 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
		);
	}

	if (session?.user) {
		return (
			<div className="flex items-center gap-3">
				{session.user.image ? (
					<img
						src={session.user.image}
						alt={session.user.name || "User avatar"}
						className="h-8 w-8 rounded-full object-cover"
					/>
				) : (
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
						<span>{session.user.name?.charAt(0).toUpperCase() || "U"}</span>
					</div>
				)}
				<button
					type="button"
					onClick={() => {
						void authClient.signOut();
					}}
					className="flex-1 h-9 px-4 text-sm font-medium bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
				>
					Sign out
				</button>
			</div>
		);
	}

	return null;
}
