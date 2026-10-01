import {
	ArrowPathIcon,
	CheckCircleIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	FolderIcon,
	FolderOpenIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppLayout } from "@/components/app-shell/layout";
import { AnimatedLink } from "@/components/ui/animated-link";
import { apiClient } from "@/lib/api-client";
import { useSession } from "@/lib/auth-client";
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
			<div className="flex items-center gap-2 py-1 text-[var(--muted)] dark:text-[#a1a1aa] font-semibold tracking-wider">
				<FolderOpenIcon className="w-4 h-4 text-[var(--blue)] flex-none" />
				<span>WORKSPACES</span>
				<span className="text-[10px] font-normal text-[var(--soft)] dark:text-[#71717a] px-1.5 py-0.5 bg-black/5 dark:bg-white/10">
					{workspaces.length}
				</span>
			</div>

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
								<AnimatedLink
									href={`/workspaces/${workspace.id}`}
									className="font-medium text-[var(--ink)] dark:text-[#f4f4f5] py-0.5"
								>
									{workspace.name}
								</AnimatedLink>

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

										<div className="flex flex-col gap-1">
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
	const { data: session } = useSession();

	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [toast, setToast] = useState<string | null>(null);

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

	const userName =
		(session?.user as { username?: string; name?: string })?.username ||
		session?.user?.name ||
		"User";
	const userFirstName = userName.split(" ")[0];

	return (
		<AppLayout>
			{toast && (
				<div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#272724] dark:bg-[#18181b] text-white dark:text-[#f4f4f5] px-4 py-3 shadow-lg border border-black/10 dark:border-white/10 text-[13px] animate-fade-in font-mono">
					<CheckCircleIcon className="w-4 h-4 text-emerald-400" />
					<span>{toast}</span>
				</div>
			)}
			
			<div className="kizen-container">
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
					<WorkspaceTree
						workspaces={workspaces}
						onDelete={handleDelete}
						deletingId={deletingId}
						variant="main"
					/>
				)}
			</div>
		</AppLayout>
	);
}
