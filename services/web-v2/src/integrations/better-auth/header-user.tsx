import { authClient } from "#/lib/auth-client";

export function HeaderUser() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return null;
	}

	return (
		<div className="flex items-center gap-2">
			{session ? (
				<>
					<div className="flex flex-col text-right">
						<span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
							{session.user.name}
						</span>
						<span className="text-[10px] text-neutral-500 dark:text-neutral-400">
							{session.user.email}
						</span>
					</div>
					<button
						type="button"
						onClick={() => {
							void authClient.signOut();
						}}
						className="flex-1 h-9 px-4 text-sm font-medium bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
					>
						Sign out
					</button>
				</>
			) : null}
		</div>
	);
}
