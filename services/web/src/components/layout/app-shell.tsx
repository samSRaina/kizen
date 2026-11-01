import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, LogOut, User } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Logo } from "#/components/ui/logo";
import { ThemeToggleButton } from "#/components/ui/theme-toggle";
import { authClient } from "#/lib/auth-client";
import { authKeys, authQueries } from "#/lib/queries/auth";
import { cn } from "#/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: sessionData } = useQuery(authQueries.session());
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

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

	// Close dropdown on click outside or Escape
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setUserMenuOpen(false);
			}
		};
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setUserMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	return (
		<div className="min-h-screen w-full bg-canvas text-text-primary font-sans selection:bg-accent-primary selection:text-accent-primary-fg flex flex-col justify-between">
			{/* Top Navbar */}
			<header className="sticky top-0 z-30 w-full bg-surface-base border-b border-border-default px-4 sm:px-8 py-3 flex items-center justify-between">
				{/* Brand & Workspaces Link */}
				<div className="flex items-center space-x-6">
					<Link to="/workspaces">
						<Logo size="md" />
					</Link>

					<nav className="flex items-center space-x-4 pl-4 sm:pl-6 border-l border-border-default text-xs font-mono font-semibold tracking-wider">
						<Link
							to="/workspaces"
							className="text-text-secondary hover:text-text-primary transition-colors [&.active]:text-text-primary [&.active]:font-bold"
						>
							WORKSPACES
						</Link>
					</nav>
				</div>

				{/* Utilities & User Dropdown */}
				<div className="flex items-center space-x-3 sm:space-x-4">
					<ThemeToggleButton
						variant="rectangle"
						blur={true}
						start="right-left"
					/>

					{/* User Profile Button with Dropdown */}
					<div className="relative" ref={dropdownRef}>
						<button
							type="button"
							onClick={() => setUserMenuOpen((prev) => !prev)}
							aria-expanded={userMenuOpen}
							className="flex items-center space-x-2 px-3 py-1.5 text-xs font-mono font-medium bg-surface-elevated hover:bg-surface-hover border border-border-default text-text-primary transition-colors cursor-pointer enabled:active:scale-[0.96]"
						>
							<User className="w-3.5 h-3.5 text-text-muted shrink-0" />
							<span className="max-w-28 sm:max-w-44 truncate">
								{user?.name || user?.email || "Account"}
							</span>
							<ChevronDown
								className={cn(
									"w-3 h-3 text-text-muted transition-transform duration-150",
									userMenuOpen && "rotate-180",
								)}
							/>
						</button>

						{/* Dropdown Menu */}
						{userMenuOpen ? (
							<div className="absolute right-0 mt-1.5 w-56 border border-border-strong bg-surface-base shadow-2xl py-1 z-50">
								{/* User Meta Header */}
								<div className="px-3.5 py-2.5 border-b border-border-default font-mono text-[11px] text-text-muted">
									<p className="text-text-primary font-bold truncate">
										{user?.name || "User"}
									</p>
									<p className="text-text-muted truncate">{user?.email}</p>
								</div>

								{/* Account Link */}
								<Link
									to="/user"
									onClick={() => setUserMenuOpen(false)}
									className="flex items-center space-x-2 px-3.5 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
								>
									<User className="w-3.5 h-3.5 text-text-muted" />
									<span>Account Details</span>
								</Link>

								{/* Sign Out Action */}
								<button
									type="button"
									onClick={() => {
										setUserMenuOpen(false);
										signOutMutation.mutate();
									}}
									disabled={signOutMutation.isPending}
									className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border-t border-border-default cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
								>
									<LogOut className="w-3.5 h-3.5" />
									<span>Sign Out</span>
								</button>
							</div>
						) : null}
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				{children}
			</main>

			{/* Minimalist Brutalist Footer */}
			{/*<footer className="w-full border-t border-border-default bg-surface-base px-4 sm:px-8 py-3.5 text-xs font-mono text-text-muted flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<span className="font-bold text-text-primary">KIZEN</span>
					<span className="text-border-strong">/</span>
					<span>SYSTEMS</span>
				</div>
				<span>PRODUCTION</span>
			</footer>*/}
		</div>
	);
}

export default AppShell;
