import { useHotkey } from "@tanstack/react-hotkeys";
import { useQuery } from "@tanstack/react-query";
import { Link, useMatches, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { HeaderActiveTimer } from "@/components/app-shell/header-active-timer";
import { Logo } from "@/components/ui/logo";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { authQueries } from "@/lib/queries/auth";
import { workspaceQueries } from "@/lib/queries/workspaces";
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog";

interface TaskbarProps {
	onToggleSidebar?: () => void;
}

export function Taskbar({ onToggleSidebar }: TaskbarProps) {
	const navigate = useNavigate();
	const matches = useMatches();
	const [shortcutsOpen, setShortcutsOpen] = useState(false);
	const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const { data: sessionData } = useQuery(authQueries.session());

	// Determine if current route is a workspace page
	const workspaceMatch = matches.find(
		(m) =>
			m.routeId.includes("/workspaces/$workspaceId") ||
			m.pathname.startsWith("/workspaces/"),
	);
	const currentWorkspaceId = (
		workspaceMatch?.params as { workspaceId?: string }
	)?.workspaceId;

	// Queries
	const { data: workspaces = [] } = useQuery(workspaceQueries.list());
	const { data: currentWorkspace } = useQuery({
		...workspaceQueries.detail(currentWorkspaceId || ""),
		enabled: Boolean(currentWorkspaceId),
	});

	// Active workspace display name
	const currentWorkspaceName =
		currentWorkspace?.name ||
		workspaces.find((w) => w.id === currentWorkspaceId)?.name ||
		"Select Workspace";

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setWorkspaceDropdownOpen(false);
			}
		}
		if (workspaceDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [workspaceDropdownOpen]);

	// Global Hotkeys
	useHotkey("?", () => setShortcutsOpen((prev) => !prev));
	useHotkey(["G", "H"], () => navigate({ to: "/workspaces" }));
	useHotkey("B", () => onToggleSidebar?.());
	useHotkey("Escape", () => setWorkspaceDropdownOpen(false));

	const isWorkspacePage = Boolean(currentWorkspaceId);
	const user = sessionData?.user;

	return (
		<aside
			role="toolbar"
			aria-label="Application Taskbar"
			className="taskbar-container select-none font-mono text-xs"
		>
			{/* Left: Industrial Mark & Home Link */}
			<div className="flex items-center gap-2 shrink-0">
				<Link
					to="/workspaces"
					className="flex items-center gap-2 hover:opacity-80 transition-opacity"
					title="Workspaces Dashboard"
				>
					<Logo size="sm" showText={false} />
				</Link>

				<Link
					to="/workspaces"
					className="ghost-btn uppercase font-bold tracking-wider"
				>
					Workspaces
				</Link>
			</div>

			{/* When on workspace page, show / {WORKSPACE_NAME} with switcher */}
			{isWorkspacePage && (
				<>
					<span className="taskbar-sep font-bold text-text-muted">/</span>

					<div ref={dropdownRef} className="taskbar-relative">
						<button
							type="button"
							aria-haspopup="true"
							aria-expanded={workspaceDropdownOpen}
							onClick={() => setWorkspaceDropdownOpen((prev) => !prev)}
							className={`ghost-btn flex items-center gap-1.5 font-bold uppercase tracking-wider ${
								workspaceDropdownOpen ? "ghost-btn-active" : ""
							}`}
						>
							<span className="truncate max-w-[160px] sm:max-w-[220px]">
								{currentWorkspaceName}
							</span>
							<span className="text-[10px] text-text-muted">
								{workspaceDropdownOpen ? "▲" : "▼"}
							</span>
						</button>

						{/* Dropdown switch menu */}
						{workspaceDropdownOpen && (
							<div role="menu" className="dropdown-panel font-mono">
								<div className="dropdown-header">Switch Workspace</div>
								{workspaces.length === 0 && (
									<div className="text-subtle-xs px-3 py-2 text-text-muted">
										No other workspaces
									</div>
								)}
								{workspaces.map((ws) => {
									const isCurrent = ws.id === currentWorkspaceId;
									return (
										<button
											key={ws.id}
											type="button"
											role="menuitem"
											onClick={() => {
												setWorkspaceDropdownOpen(false);
												navigate({
													to: "/workspaces/$workspaceId/interactions/board",
													params: { workspaceId: ws.id },
												});
											}}
											className={`dropdown-item ${
												isCurrent ? "dropdown-item-active" : ""
											}`}
										>
											<span className="truncate font-medium">{ws.name}</span>
											<div className="flex items-center gap-1.5 shrink-0 text-text-muted text-[10px]">
												<span>${ws.default_hourly_rate}/h</span>
												{isCurrent && (
													<span className="font-bold text-emerald-600">✓</span>
												)}
											</div>
										</button>
									);
								})}
							</div>
						)}
					</div>
				</>
			)}

			{/* Center: Live Timer Pill */}
			<div className="flex-1 flex justify-center items-center px-2 min-w-0">
				<HeaderActiveTimer />
			</div>

			{/* Right: Floating Sidebar Trigger, Theme Toggle & User Auth */}
			<div className="flex items-center gap-2 shrink-0">
				{/* Floating Sidebar Toggle Button: Workspace Studio */}
				<button
					type="button"
					onClick={onToggleSidebar}
					className="ghost-btn-sm flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider border border-border-default hover:border-text-primary rounded-xs"
					title="Open Workspace Creator (B)"
				>
					<span>+ Workspace</span>
					<span className="text-[9px] px-1 py-0.2 bg-surface-elevated rounded-xs text-text-muted font-mono">
						B
					</span>
				</button>

				{/* Brutalist Rectangle Theme Toggle to match landing page */}
				<ThemeToggleButton
					variant="rectangle"
					blur={true}
					start="right-left"
					className="h-7"
				/>

				{/* User Profile */}
				{user ? (
					<Link
						to="/user"
						className="ghost-btn-sm font-mono text-xs truncate max-w-[120px] sm:max-w-[180px]"
						title={`Signed in as ${user.name || user.email}. Click for account details.`}
					>
						{user.name || user.email}
					</Link>
				) : (
					<Link
						to="/authenticate"
						className="ghost-btn-sm font-mono text-xs font-bold uppercase"
					>
						Sign In
					</Link>
				)}

				{/* Keyboard Shortcuts Trigger */}
				<button
					type="button"
					onClick={() => setShortcutsOpen(true)}
					title="Keyboard shortcuts (?)"
					className="ghost-btn-sm font-mono text-xs font-bold px-2"
				>
					?
				</button>
			</div>

			<KeyboardShortcutsDialog
				isOpen={shortcutsOpen}
				onClose={() => setShortcutsOpen(false)}
			/>
		</aside>
	);
}

export default Taskbar;
