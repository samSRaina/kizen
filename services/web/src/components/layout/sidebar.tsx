import { useHotkey } from "@tanstack/react-hotkeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	workspaceKeys,
	workspaceMutations,
	workspaceQueries,
} from "@/lib/queries/workspaces";
import type { Workspace } from "@/lib/types";

interface SidebarProps {
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function Sidebar({
	isOpen: controlledOpen,
	onOpenChange,
}: SidebarProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const isOpen =
		controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

	const [isPinned, setIsPinned] = useState(false);
	const [isCreatingInstant, setIsCreatingInstant] = useState(false);
	const [isCreatingCustom, setIsCreatingCustom] = useState(false);

	// Custom workspace form state
	const [customName, setCustomName] = useState("");
	const [customRate, setCustomRate] = useState("75");

	const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { data: workspaces = [] } = useQuery(workspaceQueries.list());

	const setSidebarOpen = useCallback(
		(open: boolean) => {
			if (controlledOpen === undefined) {
				setUncontrolledOpen(open);
			}
			onOpenChange?.(open);
		},
		[controlledOpen, onOpenChange],
	);

	// Hotkeys: 'b' and 'mod+b' toggle, 'Escape' closes
	useHotkey("B", () => {
		setSidebarOpen(!isOpen);
	});
	useHotkey("Mod+B", (e) => {
		e.preventDefault();
		setSidebarOpen(!isOpen);
	});
	useHotkey("Escape", () => {
		if (isOpen) {
			setSidebarOpen(false);
			setIsPinned(false);
		}
	});




















	// Edge hover detection on the right edge of viewport
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (isPinned) return;
			if (e.clientX >= window.innerWidth - 16) {
				if (closeTimeoutRef.current) {
					clearTimeout(closeTimeoutRef.current);
					closeTimeoutRef.current = null;
				}
				setSidebarOpen(true);
			}
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
		};
	}, [isPinned, setSidebarOpen]);

	const handleMouseEnter = () => {
		if (closeTimeoutRef.current) {
			clearTimeout(closeTimeoutRef.current);
			closeTimeoutRef.current = null;
		}
		setSidebarOpen(true);
	};

	const handleMouseLeave = () => {
		if (isPinned) return;
		closeTimeoutRef.current = setTimeout(() => {
			setSidebarOpen(false);
		}, 300);
	};

	// 1-Click Instant Workspace (Notion style)
	const handleInstantWorkspace = async () => {
		if (isCreatingInstant) return;
		setIsCreatingInstant(true);
		try {
			const newWs = await workspaceMutations.create({
				name: `Workspace ${workspaces.length + 1}`,
				default_hourly_rate: 75,
			});
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
			if (!isPinned) setSidebarOpen(false);
			navigate({
				to: "/workspaces/$workspaceId/interactions/board",
				params: { workspaceId: newWs.id },
			});
		} catch (err) {
			console.error("Failed to create instant workspace:", err);
		} finally {
			setIsCreatingInstant(false);
		}
	};

	// Custom Workspace Creation
	const handleCustomWorkspaceSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = customName.trim();
		if (!trimmed || isCreatingCustom) return;

		setIsCreatingCustom(true);
		try {
			const rate = Number.parseFloat(customRate) || 75;
			const newWs = await workspaceMutations.create({
				name: trimmed,
				default_hourly_rate: rate,
			});
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
			setCustomName("");
			setCustomRate("75");
			if (!isPinned) setSidebarOpen(false);
			navigate({
				to: "/workspaces/$workspaceId/interactions/board",
				params: { workspaceId: newWs.id },
			});
		} catch (err) {
			console.error("Failed to create workspace:", err);
		} finally {
			setIsCreatingCustom(false);
		}
	};

	return (
		<>
			{/* Right edge hover detection trigger */}
			<div
				aria-hidden="true"
				onMouseEnter={() => {
					if (!isPinned) setSidebarOpen(true);
				}}
				className={`sidebar-edge-trigger ${isOpen ? "pointer-events-none" : ""}`}
			/>

			{/* Floating Right Sidebar Panel */}
			<aside
				aria-label="Workspace Creator Sidebar"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				className={`sidebar-panel font-mono text-xs ${isOpen ? "sidebar-panel-open" : ""}`}
				style={{ width: "320px" }}
			>
				{/* Sidebar Header */}
				<div className="sidebar-header flex items-center justify-between border-b border-border-default px-4 py-3 bg-surface-elevated/40">
					<div className="flex items-center gap-2">
						<span className="font-bold text-xs uppercase tracking-wider text-text-primary">
							WORKSPACE STUDIO
						</span>
					</div>

					<div className="flex items-center gap-1.5">
						{/* Pin toggle */}
						<button
							type="button"
							onClick={() => setIsPinned((prev) => !prev)}
							className={`ghost-btn-sm font-bold text-[10px] uppercase tracking-wider rounded-xs ${
								isPinned
									? "ghost-btn-active bg-accent-primary text-accent-primary-fg"
									: ""
							}`}
							title={isPinned ? "Unpin sidebar" : "Pin sidebar open"}
						>
							{isPinned ? "PINNED" : "PIN"}
						</button>

						{/* Close button */}
						<button
							type="button"
							onClick={() => {
								setSidebarOpen(false);
								setIsPinned(false);
							}}
							className="ghost-btn-sm text-text-muted hover:text-text-primary px-2"
							title="Close (Esc)"
						>
							✕
						</button>
					</div>
				</div>

				{/* Sidebar Content: Exclusively Options to Create Workspaces */}
				<div className="sidebar-content flex-1 overflow-y-auto p-4 flex flex-col gap-6">
					{/* Option 1: 1-Click Instant Workspace */}
					<div className="flex flex-col gap-2">
						<span className="sidebar-section-title font-bold text-[10px] uppercase tracking-wider text-text-muted">
							INSTANT LAUNCH
						</span>
						<button
							type="button"
							onClick={handleInstantWorkspace}
							disabled={isCreatingInstant}
							className="w-full h-9 flex items-center justify-center gap-2 px-3 text-xs font-mono font-bold uppercase tracking-wider rounded-xs border border-border-default bg-surface-base hover:bg-surface-elevated hover:border-text-primary text-text-primary transition-all cursor-pointer shadow-2xs disabled:opacity-50"
						>
							<span>
								{isCreatingInstant ? "Creating..." : "⚡ Quick Workspace"}
							</span>
						</button>
						<p className="text-[10px] text-text-muted leading-tight">
							Instant client workspace initialized at $75/hr.
						</p>
					</div>

					{/* Option 2: Custom Workspace Form */}
					<div className="flex flex-col gap-2">
						<span className="sidebar-section-title font-bold text-[10px] uppercase tracking-wider text-text-muted">
							CUSTOM WORKSPACE
						</span>
						<form
							onSubmit={handleCustomWorkspaceSubmit}
							className="flex flex-col gap-3"
						>
							<div className="flex flex-col gap-1">
								<label
									htmlFor="custom-ws-name"
									className="text-[10px] font-bold text-text-muted uppercase"
								>
									Workspace Name
								</label>
								<input
									id="custom-ws-name"
									type="text"
									placeholder="e.g. Acme Redesign"
									value={customName}
									onChange={(e) => setCustomName(e.target.value)}
									disabled={isCreatingCustom}
									className="h-8 px-2.5 text-xs font-mono rounded-xs border border-border-default bg-surface-base text-text-primary placeholder:text-text-muted focus:border-text-primary outline-none"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label
									htmlFor="custom-ws-rate"
									className="text-[10px] font-bold text-text-muted uppercase"
								>
									Hourly Rate ($/hr)
								</label>
								<input
									id="custom-ws-rate"
									type="number"
									min="0"
									step="5"
									placeholder="75"
									value={customRate}
									onChange={(e) => setCustomRate(e.target.value)}
									disabled={isCreatingCustom}
									className="h-8 px-2.5 text-xs font-mono rounded-xs border border-border-default bg-surface-base text-text-primary placeholder:text-text-muted focus:border-text-primary outline-none"
								/>
							</div>

							<button
								type="submit"
								disabled={!customName.trim() || isCreatingCustom}
								className="w-full h-8 mt-1 flex items-center justify-center text-xs font-mono font-bold uppercase tracking-wider rounded-xs bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
							>
								{isCreatingCustom ? "Creating..." : "Create Workspace"}
							</button>
						</form>
					</div>

					{/* Existing Workspaces Jump List */}
					<div className="flex flex-col gap-2 pt-2 border-t border-border-default">
						<span className="sidebar-section-title font-bold text-[10px] uppercase tracking-wider text-text-muted flex items-center justify-between">
							<span>YOUR WORKSPACES</span>
							<span>{workspaces.length}</span>
						</span>

						<div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
							{workspaces.map((ws: Workspace) => (
								<button
									key={ws.id}
									type="button"
									onClick={() => {
										if (!isPinned) setSidebarOpen(false);
										navigate({
											to: "/workspaces/$workspaceId/interactions/board",
											params: { workspaceId: ws.id },
										});
									}}
									className="flex items-center justify-between p-2 rounded-xs border border-border-subtle bg-surface-base hover:bg-surface-elevated hover:border-border-strong text-left transition-colors cursor-pointer"
								>
									<span className="truncate font-semibold text-text-primary">
										{ws.name}
									</span>
									<span className="text-[10px] text-text-muted shrink-0">
										${ws.default_hourly_rate}/h
									</span>
								</button>
							))}
						</div>

						<Link
							to="/workspaces"
							onClick={() => {
								if (!isPinned) setSidebarOpen(false);
							}}
							className="text-[10px] uppercase font-bold text-text-muted hover:text-text-primary text-center py-1 mt-1 hover:underline"
						>
							View All in Grid →
						</Link>
					</div>
				</div>

				{/* Sidebar Footer */}
				<div className="sidebar-footer px-4 py-2 border-t border-border-default bg-surface-elevated/40 text-[10px] text-text-muted flex items-center justify-between">
					<span>[B] TOGGLE</span>
					<span>[ESC] CLOSE</span>
				</div>
			</aside>
		</>
	);
}

export default Sidebar;
