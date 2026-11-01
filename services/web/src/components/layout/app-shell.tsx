import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "#/components/ui/logo";
import { ThemeToggleButton } from "#/components/ui/theme-toggle";
import { authClient } from "#/lib/auth-client";
import { authKeys, authQueries } from "#/lib/queries/auth";

export function AppShell({ children }: { children: ReactNode }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: sessionData } = useQuery(authQueries.session());

	const user = sessionData?.user;

	const signOutMutation = useMutation({
		mutationFn: async () => {
			await authClient.signOut();
		},
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: authKeys.all });
			navigate({ to: "/authenticate" });
		},
	});

	return (
		<div className="min-h-screen w-full bg-canvas text-text-primary font-sans selection:bg-accent-primary selection:text-accent-primary-fg flex flex-col justify-between">
			{/* Top Bar */}
			<header className="w-full bg-surface-base border-b border-border-default px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
				<div className="flex items-center space-x-6">
					<Link to="/workspaces">
						<Logo />
					</Link>

					<nav className="hidden sm:flex items-center space-x-4 pl-6 border-l border-border-default text-xs font-mono font-semibold tracking-wider">
						<Link
							to="/workspaces"
							className="text-text-secondary hover:text-text-primary transition-colors [&.active]:text-text-primary [&.active]:font-bold"
						>
							WORKSPACES
						</Link>
						<Link
							to="/user"
							className="text-text-secondary hover:text-text-primary transition-colors [&.active]:text-text-primary [&.active]:font-bold"
						>
							ACCOUNT
						</Link>
					</nav>
				</div>

				<div className="flex items-center space-x-3 sm:space-x-4">
					<Link
						to="/user"
						className="flex items-center space-x-2 text-xs text-text-secondary border-r border-border-default pr-3 sm:pr-4 hover:text-text-primary transition-colors"
					>
						<User className="w-4 h-4 text-text-muted" />
						<span className="font-mono text-xs max-w-35 sm:max-w-none truncate">
							{user?.name || user?.email || "Operator"}
						</span>
					</Link>

					<ThemeToggleButton
						variant="rectangle"
						blur={true}
						start="right-left"
					/>

					<button
						type="button"
						onClick={() => signOutMutation.mutate()}
						disabled={signOutMutation.isPending}
						className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider bg-surface-elevated hover:bg-surface-hover border border-border-default text-text-primary transition-colors cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
						title="Sign Out"
					>
						<LogOut className="w-3.5 h-3.5" />
						<span className="hidden sm:inline">SIGN OUT</span>
					</button>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				{children}
			</main>

			{/* Footer */}
			<footer className="w-full border-t border-border-default bg-surface-base px-4 sm:px-8 py-4 text-center sm:text-left text-xs font-mono text-text-muted flex flex-col sm:flex-row items-center justify-between">
				<span>KIZEN SYSTEMS</span>
				<span className="mt-1 sm:mt-0">PRODUCTION CLIENT</span>
			</footer>
		</div>
	);
}

export default AppShell;
