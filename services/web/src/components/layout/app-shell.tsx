import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
	Check,
	ChevronDown,
	FolderKanban,
	Home,
	LayoutGrid,
	LogOut,
	User,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { ThemeToggleButton } from "#/components/ui/theme-toggle";
import { authClient } from "#/lib/auth-client";
import { clearCachedAuthToken } from "#/lib/goapi-client";
import { authQueries } from "#/lib/queries/auth";
import { workspaceQueries } from "#/lib/queries/workspaces";
import { cn } from "#/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
	const navigate = useNavigate();
	const location = useLocation();
	const queryClient = useQueryClient();
	const { data: sessionData } = useQuery(authQueries.session());
	const { data: workspaces = [] } = useQuery(workspaceQueries.list());

	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [workspacesMenuOpen, setWorkspacesMenuOpen] = useState(false);

	const userDropdownRef = useRef<HTMLDivElement>(null);
	const workspacesDropdownRef = useRef<HTMLDivElement>(null);

	const user = sessionData?.user;

	// Determine active workspace from pathname if on a workspace route
	const activeWorkspaceIdMatch = location.pathname.match(
		/^\/workspaces\/([^/]+)/,
	);
	const activeWorkspaceId = activeWorkspaceIdMatch
		? activeWorkspaceIdMatch[1]
		: null;
	const activeWorkspace = activeWorkspaceId
		? workspaces.find((w) => w.id === activeWorkspaceId)
		: null;

	const signOutMutation = useMutation({
		mutationFn: async () => {
			await authClient.signOut();
		},
		onSuccess: () => {
			clearCachedAuthToken();
			queryClient.clear();
			navigate({ to: "/authenticate" });
		},
	});

	// Close dropdowns on click outside or Escape
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node;
			if (
				userDropdownRef.current &&
				!userDropdownRef.current.contains(target)
			) {
				setUserMenuOpen(false);
			}
			if (
				workspacesDropdownRef.current &&
				!workspacesDropdownRef.current.contains(target)
			) {
				setWorkspacesMenuOpen(false);
			}
		};
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setUserMenuOpen(false);
				setWorkspacesMenuOpen(false);
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
			{/* Top Navbar - 32px standard row */}
			<header className="sticky top-0 z-30 w-full h-8 bg-surface-base/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shadow-2xs">
				{/* Left: Home Button + Workspaces Switcher Toggle */}
				<div className="flex items-center space-x-1.5 sm:space-x-2 h-8">
					{/* Home button with Home logo */}
					<Link
						to="/workspaces"
						className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-elevated/70 rounded-xs transition-colors cursor-pointer"
						title="Home (Dashboard)"
					>
						<Home className="w-3.5 h-3.5" />
					</Link>

					{/* Workspaces Switcher Dropdown Toggle */}
					<div
						className="relative h-8 flex items-center"
						ref={workspacesDropdownRef}
					>
						<button
							type="button"
							onClick={() => setWorkspacesMenuOpen((prev) => !prev)}
							aria-expanded={workspacesMenuOpen}
							className="h-8 flex items-center space-x-2 px-2 text-xs font-mono font-bold uppercase tracking-wider bg-transparent hover:bg-surface-elevated/70 text-text-primary rounded-xs transition-colors cursor-pointer"
							title="Switch Workspace"
						>
							<FolderKanban className="w-3.5 h-3.5 text-text-muted shrink-0" />
							<span className="max-w-[140px] sm:max-w-[240px] truncate text-xs">
								{activeWorkspace ? activeWorkspace.name : "WORKSPACES"}
							</span>
							<ChevronDown
								className={cn(
									"w-3 h-3 text-text-muted transition-transform duration-150 shrink-0",
									workspacesMenuOpen && "rotate-180",
								)}
							/>
						</button>

						{/* Dropdown Menu listing all user workspaces */}
						{workspacesMenuOpen ? (
							<div className="absolute left-0 top-full mt-1 w-72 bg-surface-base shadow-2xl py-1 z-50 font-mono text-xs rounded-xs ring-1 ring-border-default/20">
								<div className="px-3.5 h-8 border-b border-border-default/15 text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center justify-between">
									<span>Switch Workspace</span>
									<span className="px-1.5 py-0.5 bg-surface-elevated/70 text-[9px] rounded-xs">
										{workspaces.length}
									</span>
								</div>

								<div className="max-h-64 overflow-y-auto divide-y divide-border-default/10">
									{workspaces.length === 0 ? (
										<div className="px-3 py-3 text-center text-text-muted text-[11px]">
											No workspaces found
										</div>
									) : (
										workspaces.map((ws) => {
											const isCurrent = ws.id === activeWorkspaceId;
											return (
												<Link
													key={ws.id}
													to="/workspaces/$workspaceId"
													params={{ workspaceId: ws.id }}
													onClick={() => setWorkspacesMenuOpen(false)}
													className={cn(
														"flex items-center justify-between px-3 h-8 hover:bg-surface-elevated/70 text-text-primary transition-colors group",
														isCurrent && "bg-surface-elevated/50 font-bold",
													)}
												>
													<div className="truncate mr-2">
														<span className="truncate block text-xs">
															{ws.name}
														</span>
													</div>

													<div className="flex items-center space-x-1.5 shrink-0">
														<span className="text-[10px] text-text-muted">
															{ws.default_hourly_rate}/hr
														</span>
														{isCurrent ? (
															<Check className="w-3.5 h-3.5 text-text-primary" />
														) : null}
													</div>
												</Link>
											);
										})
									)}
								</div>

								<div className="border-t border-border-default/15 pt-0.5 mt-0.5">
									<Link
										to="/workspaces"
										onClick={() => setWorkspacesMenuOpen(false)}
										className="flex items-center space-x-2 px-3 h-8 hover:bg-surface-elevated/70 text-text-muted hover:text-text-primary transition-colors text-[11px]"
									>
										<LayoutGrid className="w-3.5 h-3.5 text-text-muted" />
										<span>All Workspaces Dashboard</span>
									</Link>
								</div>
							</div>
						) : null}
					</div>
				</div>

				{/* Utilities & User Dropdown */}
				<div className="flex items-center space-x-1.5 sm:space-x-2 h-8">
					<ThemeToggleButton
						variant="rectangle"
						blur={true}
						start="right-left"
						className="h-8"
					/>

					{/* User Profile Button with Dropdown */}
					<div className="relative h-8 flex items-center" ref={userDropdownRef}>
						<button
							type="button"
							onClick={() => setUserMenuOpen((prev) => !prev)}
							aria-expanded={userMenuOpen}
							className="h-8 flex items-center space-x-2 px-2 text-xs font-mono font-medium bg-transparent hover:bg-surface-elevated/70 text-text-primary rounded-xs transition-colors cursor-pointer enabled:active:scale-[0.96]"
						>
							<User className="w-3.5 h-3.5 text-text-muted shrink-0" />
							<span className="max-w-28 sm:max-w-44 truncate text-xs">
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
							<div className="absolute right-0 top-full mt-1 w-56 bg-surface-base shadow-2xl py-1 z-50 rounded-xs ring-1 ring-border-default/20">
								{/* User Meta Header */}
								<div className="px-3.5 py-2 border-b border-border-default/15 font-mono text-[11px] text-text-muted">
									<p className="text-text-primary font-bold truncate">
										{user?.name || "User"}
									</p>
									<p className="text-text-muted truncate">{user?.email}</p>
								</div>

								{/* Account Link */}
								<Link
									to="/user"
									onClick={() => setUserMenuOpen(false)}
									className="flex items-center space-x-2 px-3.5 h-8 text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary hover:bg-surface-elevated/70 transition-colors"
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
									className="w-full flex items-center space-x-2 px-3.5 h-8 text-xs font-mono font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border-t border-border-default/15 cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
								>
									<LogOut className="w-3.5 h-3.5" />
									<span>Sign Out</span>
								</button>
							</div>
						) : null}
					</div>
				</div>
			</header>

			{/* Main Content - Expanded max-w-[1440px] for wider shell breathing room */}
			<main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				{children}
			</main>
		</div>
	);
}

export default AppShell;
