import {
	ArrowPathIcon,
	Bars3Icon,
	CheckCircleIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	ChevronUpDownIcon,
	FolderIcon,
	FolderOpenIcon,
	HomeIcon,
	SparklesIcon,
	TrashIcon,
	UserCircleIcon,
} from "@heroicons/react/24/outline";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import {
	Link000,
	Link001,
	Link002,
	Link003,
	Link004,
	Link005,
} from "@/components/v1/skiper40";
import { apiClient } from "@/lib/api-client";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { components } from "@/types/api.gen";

type Workspace = components["schemas"]["Workspace"];

export const Route = createFileRoute("/_authenticated/home")({
	component: Home,
});

function getTimeOfDayGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}

function Logo() {
	return (
		<div className="flex items-center gap-[3px] font-bold text-[17px] tracking-tight">
			<span className="grid place-items-center w-[18px] h-[20px] border border-[var(--blue)] text-[var(--blue)] font-serif text-[17px]">
				K
			</span>
			<span>izen</span>
			<i className="w-[5px] h-[5px] border border-[var(--blue)] ml-[1px]" />
		</div>
	);
}

function Avatar({
	initials,
	image,
}: {
	initials: string;
	image?: string | null;
}) {
	if (image) {
		return (
			<img
				src={image}
				alt="User avatar"
				className="w-8 h-8 rounded-full border border-[var(--line)] object-cover flex-none"
			/>
		);
	}
	return (
		<div className="grid place-items-center w-8 h-8 rounded-full bg-[#ced6ff] text-[#3448aa] dark:bg-[#202850] dark:text-[#a0b0ff] font-mono text-[11px] font-medium flex-none">
			{initials}
		</div>
	);
}

function WorkspaceTree({
	workspaces,
	onDelete,
	deletingId,
	variant = "main",
}: {
	workspaces: Workspace[];
	onDelete?: (id: string, name: string) => void;
	deletingId?: string | null;
	variant?: "main" | "sidebar";
}) {
	const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
		const init: Record<string, boolean> = {};
		workspaces.forEach((w) => {
			init[w.id] = true;
		});
		return init;
	});

	// If no workspaces exist, no tree
	if (workspaces.length === 0) {
		if (variant === "sidebar") return null;
		return (
			<div className="p-8 border border-dashed border-[var(--line)] dark:border-white/10 text-center my-6">
				<p className="font-mono text-[12px] text-[var(--muted)] dark:text-[#a1a1aa]">
					No workspaces found.
				</p>
				<p className="font-mono text-[11px] text-[var(--soft)] dark:text-[#71717a] mt-1">
					Shortcut keys for creation not implemented yet.
				</p>
			</div>
		);
	}

	const toggleExpand = (id: string) => {
		setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	return (
		<div
			className={cn(
				"font-mono select-none",
				variant === "main" ? "max-w-3xl text-[13px] my-4" : "text-[12px]",
			)}
		>
			{/* Root Node: WORKSPACES */}
			<div className="flex items-center gap-2 py-1 text-[var(--muted)] dark:text-[#a1a1aa] font-semibold tracking-wider">
				<FolderOpenIcon className="w-4 h-4 text-[var(--blue)] flex-none" />
				<span>WORKSPACES</span>
				<span className="text-[10px] font-normal text-[var(--soft)] dark:text-[#71717a] px-1.5 py-0.5 bg-black/5 dark:bg-white/10">
					{workspaces.length}
				</span>
			</div>

			{/* Sub Directory Tree Structure */}
			<div className="pl-4 border-l border-dashed border-[var(--line)] dark:border-white/15 ml-2 mt-1 flex flex-col gap-2">
				{workspaces.map((workspace, index) => {
					const isLast = index === workspaces.length - 1;
					const isExpanded = !!expanded[workspace.id];

					return (
						<div key={workspace.id} className="relative">
							<div className="flex items-center gap-2 group/node">
								<span className="text-[var(--soft)] dark:text-[#71717a] text-[11px]">
									{isLast ? "└──" : "├──"}
								</span>
								<button
									type="button"
									onClick={() => toggleExpand(workspace.id)}
									className="text-[var(--soft)] dark:text-[#71717a] hover:text-[var(--ink)] dark:hover:text-[#f4f4f5] cursor-pointer outline-none"
									title={isExpanded ? "Collapse" : "Expand"}
								>
									{isExpanded ? (
										<ChevronDownIcon className="w-3.5 h-3.5" />
									) : (
										<ChevronRightIcon className="w-3.5 h-3.5" />
									)}
								</button>
								<FolderIcon className="w-3.5 h-3.5 text-[var(--blue)] flex-none" />
								{/* Button styling following skiper40 */}
								<Link001
									href={`/workspaces/${workspace.id}`}
									className="font-medium text-[var(--ink)] dark:text-[#f4f4f5] py-0.5"
								>
									{workspace.name}
								</Link001>

								{onDelete && (
									<button
										type="button"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											onDelete(workspace.id, workspace.name);
										}}
										disabled={deletingId === workspace.id}
										className="ml-auto opacity-0 group-hover/node:opacity-100 p-1 text-[var(--soft)] dark:text-[#71717a] hover:text-red-600 dark:hover:text-red-400 transition-opacity cursor-pointer"
										title="Delete workspace"
									>
										{deletingId === workspace.id ? (
											<ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
										) : (
											<TrashIcon className="w-3.5 h-3.5" />
										)}
									</button>
								)}
							</div>

							{/* Two subtrees side-by-side upon expanding */}
							{isExpanded && (
								<div className="pl-6 border-l border-dashed border-[var(--line)] dark:border-white/10 ml-2 mt-1 mb-2 pt-1 pb-1">
									<div
										className={cn(
											"gap-4",
											variant === "main"
												? "grid grid-cols-1 md:grid-cols-2"
												: "flex flex-col gap-3",
										)}
									>
										{/* Left Subtree: DESCRIPTION */}
										<div className="flex flex-col gap-1">
											<div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--muted)] dark:text-[#a1a1aa] tracking-wider uppercase">
												<span className="text-[var(--soft)] dark:text-[#71717a] text-[10px]">
													├──
												</span>
												<span>DESCRIPTION</span>
											</div>
											<div className="flex items-start gap-1.5 pl-3">
												<span className="text-[var(--soft)] dark:text-[#71717a] text-[10px] mt-0.5">
													└──
												</span>
												<span className="text-[12px] text-[var(--ink)]/80 dark:text-[#d4d4d8] font-normal leading-relaxed break-words">
													{workspace.description || (
														<span className="text-[var(--soft)] dark:text-[#71717a] italic">
															None
														</span>
													)}
												</span>
											</div>
										</div>

										{/* Right Subtree: 2 layers (HOURLY RATE, Updated at) */}
										<div className="flex flex-col gap-1">
											{/* Layer 1: HOURLY RATE (plain numerical units, no dollar sign) */}
											<div className="flex items-center gap-1.5 text-[12px]">
												<span className="text-[var(--soft)] dark:text-[#71717a] text-[10px]">
													├──
												</span>
												<span className="text-[11px] font-semibold text-[var(--muted)] dark:text-[#a1a1aa] tracking-wider uppercase">
													HOURLY RATE:
												</span>
												<span className="text-[var(--ink)] dark:text-[#f4f4f5] font-normal">
													{workspace.default_hourly_rate ?? 0}{" "}
													<span className="text-[10px] text-[var(--soft)] dark:text-[#71717a]">
														units/hr
													</span>
												</span>
											</div>

											{/* Layer 2: Updated at */}
											<div className="flex items-center gap-1.5 text-[12px]">
												<span className="text-[var(--soft)] dark:text-[#71717a] text-[10px]">
													└──
												</span>
												<span className="text-[11px] font-semibold text-[var(--muted)] dark:text-[#a1a1aa] tracking-wider uppercase">
													UPDATED AT:
												</span>
												<span className="text-[var(--ink)] dark:text-[#f4f4f5] font-normal">
													{workspace.updated_at
														? new Date(workspace.updated_at).toLocaleDateString(
																undefined,
																{
																	year: "numeric",
																	month: "short",
																	day: "numeric",
																},
												  )
													: "N/A"}
												</span>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function Home() {
	const navigate = useNavigate();
	const { data: session } = useSession();

	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [toast, setToast] = useState<string | null>(null);

	const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("kizen_sidebar_open") === "true";
		}
		return false;
	});

	const handleSetSidebarOpen = (open: boolean) => {
		setIsSidebarOpen(open);
		if (typeof window !== "undefined") {
			localStorage.setItem("kizen_sidebar_open", open ? "true" : "false");
		}
	};

	const showToast = (message: string) => {
		setToast(message);
		setTimeout(() => setToast(null), 3000);
	};

	const fetchAllWorkspaces = useCallback(async () => {
		try {
			setIsLoading(true);
			setFetchError(null);
			const { data, error } = await apiClient.GET("/api/v1/workspaces");
			if (error) {
				setFetchError(
					error.detail || error.title || "Failed to load workspaces",
				);
			} else if (data) {
				setWorkspaces(data);
			}
		} catch (err: unknown) {
			setFetchError(
				err instanceof Error ? err.message : "Failed to load workspaces",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAllWorkspaces();
	}, [fetchAllWorkspaces]);

	const handleDelete = async (id: string, name: string) => {
		if (
			!window.confirm(
				`Are you sure you want to delete "${name}"? This action cannot be undone.`,
			)
		) {
			return;
		}

		try {
			setDeletingId(id);
			const { error } = await apiClient.DELETE("/api/v1/workspaces/{id}", {
				params: {
					path: { id },
				},
			});

			if (error) {
				showToast(
					error.detail || error.title || `Failed to delete workspace "${name}"`,
				);
			} else {
				setWorkspaces((prev) => prev.filter((w) => w.id !== id));
				showToast(`Workspace "${name}" deleted`);
			}
		} catch (err: unknown) {
			showToast(
				err instanceof Error ? err.message : "An unexpected error occurred",
			);
		} finally {
			setDeletingId(null);
		}
	};

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({ to: "/" });
				},
			},
		});
	};

	const userName =
		(session?.user as { username?: string; name?: string })?.username ||
		session?.user?.name ||
		"User";
	const userFirstName = userName.split(" ")[0];
	const userEmail = session?.user?.email;
	const userInitials = userName.slice(0, 2).toUpperCase();
	const userImage = session?.user?.image;

	return (
		<div className="min-h-screen bg-[var(--paper)] dark:bg-[#0c0c0e] text-[var(--ink)] dark:text-[#f4f4f5] font-sans relative flex">
			{/* Toast Notification */}
			{toast && (
				<div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#272724] dark:bg-[#18181b] text-white dark:text-[#f4f4f5] px-4 py-3 shadow-lg border border-black/10 dark:border-white/10 text-[13px] animate-fade-in font-mono">
					<CheckCircleIcon className="w-4 h-4 text-emerald-400" />
					<span>{toast}</span>
				</div>
			)}

			{/* Three Horizontal Lines Button at Top Right to Expand Sidebar */}
			{!isSidebarOpen && (
				<button
					type="button"
					onClick={() => handleSetSidebarOpen(true)}
					className="fixed top-6 right-8 z-30 p-2 text-[var(--ink)] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
					title="Open menu"
					aria-label="Open menu"
				>
					<Bars3Icon className="w-5 h-5" />
				</button>
			)}

			{/* Main Content Stage */}
			<main className="flex-1 min-w-0 overflow-y-auto px-6 py-12 md:py-16 pb-24 bg-[var(--paper)] dark:bg-[#0c0c0e] text-[var(--ink)] dark:text-[#f4f4f5]">
				<div className="w-full max-w-[1140px] mx-auto">
					<div className="mb-[40px]">
						<h1 className="text-[40px] tracking-tight font-medium my-0 text-[var(--ink)] dark:text-[#f4f4f5]">
							{getTimeOfDayGreeting()}, {userFirstName}.
						</h1>
					</div>

					<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[var(--line)] dark:border-white/10 gap-4">
						<div className="flex items-center gap-3">
							<h2 className="text-[17px] font-medium m-0 tracking-tight text-[var(--ink)] dark:text-[#f4f4f5]">
								Workspaces
							</h2>
							<span className="text-[var(--muted)] dark:text-[#a1a1aa] text-[13px] font-mono">
								{workspaces.length} active
							</span>
						</div>
					</div>

					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-20 text-[var(--muted)] dark:text-[#a1a1aa]">
							<ArrowPathIcon className="w-6 h-6 animate-spin mb-3" />
							<span className="text-[13px] font-mono">
								Loading your workspaces…
							</span>
						</div>
					) : fetchError ? (
						<div className="border border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 p-6 flex flex-col items-start gap-2 mb-8">
							<strong>Could not load workspaces</strong>
							<p className="text-[13px] m-0">{fetchError}</p>
							<button
								type="button"
								onClick={fetchAllWorkspaces}
								className="mt-2 text-[11px] bg-red-600 text-white px-3 py-1.5 hover:bg-red-700 font-medium font-mono"
							>
								Try again
							</button>
						</div>
					) : (
						/* Workspace Tree Hierarchy */
						<WorkspaceTree
							workspaces={workspaces}
							onDelete={handleDelete}
							deletingId={deletingId}
							variant="main"
						/>
					)}
				</div>
			</main>

			{/* Collapsible Right Sidebar */}
			<aside
				className={cn(
					"bg-[#fbfbf9] dark:bg-[#151517] h-screen sticky top-0 flex flex-col justify-between transition-[width,opacity] duration-300 z-20 flex-shrink-0",
					isSidebarOpen
						? "w-72 border-l border-[var(--line)] dark:border-white/10 opacity-100"
						: "w-0 overflow-hidden border-l-0 opacity-0 pointer-events-none",
				)}
			>
				{/* Top Section */}
				<div className="flex flex-col p-4 gap-2 overflow-y-auto flex-1">
					{/* Sidebar Header with Brand & Theme Toggle to the LEFT of the Collapse Button */}
					<div className="flex items-center justify-between min-h-[36px] mb-3 px-1">
						<Link to="/home" className="text-inherit no-underline">
							<Logo />
						</Link>
						<div className="flex items-center gap-1">
							<ThemeToggleButton className="w-7 h-7 rounded-none border border-transparent hover:border-[var(--line)] dark:hover:border-white/10" />
							<button
								type="button"
								onClick={() => handleSetSidebarOpen(false)}
								className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-[var(--muted)] dark:text-[#a1a1aa] hover:text-[var(--ink)] dark:hover:text-[#f4f4f5]"
								title="Collapse sidebar"
								aria-label="Collapse sidebar"
							>
								<Bars3Icon className="w-5 h-5" />
							</button>
						</div>
					</div>



					{/* Agents Section (Placeholder) */}
					<div className="mt-4 flex flex-col gap-1.5">
						<div className="flex items-center justify-between px-3 py-1">
							<span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] dark:text-[#a1a1aa]">
								Agents
							</span>
							<span className="text-[9px] font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[var(--muted)] dark:text-[#a1a1aa]">
								Standby
							</span>
						</div>

						{/* Placeholder Agent Item */}
						<div
							className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-[var(--muted)] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5 rounded-none transition-colors"
							title="Agent Worker (Placeholder)"
						>
							<SparklesIcon className="w-4 h-4 flex-shrink-0 text-[#6257d8]" />
							<div className="flex flex-col min-w-0">
								<span className="truncate font-medium text-[var(--ink)] dark:text-[#f4f4f5] leading-tight">
									Agent Runner
								</span>
								<span className="text-[10px] text-[var(--soft)] dark:text-[#71717a] truncate leading-tight mt-0.5">
									Awaiting deployment
								</span>
							</div>
						</div>
					</div>


				</div>

				{/* User Profile Clickable Row at the Very Bottom */}
				<div className="p-4 border-t border-[var(--line)] dark:border-white/10">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<motion.button
								type="button"
								whileHover={{ y: -1 }}
								whileTap={{ scale: 0.98 }}
								transition={{ duration: 0.15, ease: "easeOut" }}
								className="group w-full flex items-center gap-2.5 p-2 transition-all cursor-pointer outline-none min-w-0 text-left rounded-none text-[var(--ink)] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 data-[state=open]:bg-black/5 dark:data-[state=open]:bg-white/5 focus-visible:ring-1 focus-visible:ring-[var(--blue)]"
								aria-label="User account menu"
							>
								<motion.div
									whileHover={{ scale: 1.05 }}
									transition={{ duration: 0.15 }}
									className="flex-none"
								>
									<Avatar initials={userInitials} image={userImage} />
								</motion.div>
								<div className="flex-1 min-w-0">
									<p className="text-[13px] font-medium text-[var(--ink)] dark:text-[#f4f4f5] truncate leading-tight group-hover:text-[var(--blue)] transition-colors">
										{userName}
									</p>
									{userEmail && (
										<p className="text-[11px] text-[var(--soft)] dark:text-[#71717a] truncate leading-tight mt-0.5">
											{userEmail}
										</p>
									)}
								</div>
								<ChevronUpDownIcon className="w-4 h-4 text-[var(--soft)] dark:text-[#71717a] group-hover:text-[var(--ink)] dark:group-hover:text-[var(--ink)] transition-colors flex-none opacity-50 group-hover:opacity-100" />
							</motion.button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							side="top"
							sideOffset={10}
							className="w-56 bg-[var(--card)] dark:bg-[#18181b] border border-[var(--line)] dark:border-white/10 shadow-lg rounded-none p-1 z-50 font-sans text-[var(--ink)] dark:text-[#f4f4f5]"
						>
							<DropdownMenuLabel className="font-normal px-2.5 py-2">
								<div className="flex flex-col space-y-0.5">
									<p className="text-[13px] font-medium text-[var(--ink)] dark:text-[#f4f4f5] leading-snug">
										{userName}
									</p>
									{userEmail && (
										<p className="text-[11px] text-[var(--soft)] dark:text-[#71717a] leading-snug truncate">
											{userEmail}
										</p>
									)}
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator className="bg-[var(--line)] dark:bg-white/10 my-1 -mx-1" />

							{/* Account Settings Placeholder */}
							<DropdownMenuItem
								className="flex items-center justify-between px-2.5 py-2 text-[12px] text-[var(--ink)] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-none outline-none transition-colors"
								onClick={() => {
									// Account settings placeholder (to be implemented)
								}}
							>
								<div className="flex items-center gap-2">
									<UserCircleIcon className="w-4 h-4 text-[var(--soft)] dark:text-[#71717a]" />
									<span>Account</span>
								</div>
								<span className="text-[10px] font-mono text-[var(--soft)] dark:text-[#71717a]">
									Settings
								</span>
							</DropdownMenuItem>

							<DropdownMenuSeparator className="bg-[var(--line)] dark:bg-white/10 my-1 -mx-1" />

							{/* Sign Out option: standard color, no logo, no red highlight */}
							<DropdownMenuItem
								onClick={handleSignOut}
								className="flex items-center px-2.5 py-2 text-[12px] text-[var(--ink)] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-none outline-none transition-colors"
							>
								<span>Sign out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</aside>
		</div>
	);
}
