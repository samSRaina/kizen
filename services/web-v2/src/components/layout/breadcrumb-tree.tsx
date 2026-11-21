import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, Home, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MOCK_PROJECTS, MOCK_WORKSPACES } from "#/lib/mock-data";

export function BreadcrumbTree() {
	const location = useLocation();
	const navigate = useNavigate();
	const pathname = location.pathname;

	// Extract active workspace and project from URL path
	const matchWs = pathname.match(/^\/ws\/([^/]+)/);
	const activeWorkspaceId = matchWs ? matchWs[1] : null;

	const matchProj = pathname.match(/^\/ws\/[^/]+\/p\/([^/]+)/);
	const activeProjectId = matchProj ? matchProj[1] : null;

	const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
	const [isProjectOpen, setIsProjectOpen] = useState(false);

	const workspaceRef = useRef<HTMLDivElement>(null);
	const workspaceTriggerRef = useRef<HTMLButtonElement>(null);
	const projectRef = useRef<HTMLDivElement>(null);
	const projectTriggerRef = useRef<HTMLButtonElement>(null);

	const currentWorkspace = activeWorkspaceId
		? (MOCK_WORKSPACES.find((w) => w.id === activeWorkspaceId) ?? {
				id: activeWorkspaceId,
				name: activeWorkspaceId,
			})
		: null;

	const currentProject =
		activeWorkspaceId && activeProjectId
			? (MOCK_PROJECTS.find(
					(p) =>
						p.id === activeProjectId && p.workspace_id === activeWorkspaceId,
				) ??
				MOCK_PROJECTS.find((p) => p.id === activeProjectId) ?? {
					id: activeProjectId,
					name: activeProjectId,
				})
			: null;

	const availableProjects = activeWorkspaceId
		? MOCK_PROJECTS.filter((p) => p.workspace_id === activeWorkspaceId)
		: [];

	// Handle outside clicks and Escape key
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				workspaceRef.current &&
				!workspaceRef.current.contains(e.target as Node)
			) {
				setIsWorkspaceOpen(false);
			}
			if (
				projectRef.current &&
				!projectRef.current.contains(e.target as Node)
			) {
				setIsProjectOpen(false);
			}
		}

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				if (isWorkspaceOpen) {
					setIsWorkspaceOpen(false);
					workspaceTriggerRef.current?.focus();
				}
				if (isProjectOpen) {
					setIsProjectOpen(false);
					projectTriggerRef.current?.focus();
				}
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isWorkspaceOpen, isProjectOpen]);

	return (
		<nav
			className="flex items-center gap-1.5 text-xs text-[#8e8e96]"
			aria-label="Breadcrumb Navigation"
		>
			{/* Root: {Home symbol} */}
			<Link
				to="/home"
				title="Home"
				aria-label="Home"
				className="flex items-center text-[#8e8e96] hover:text-[#f4f4f5] transition-colors p-1 rounded"
			>
				<Home className="w-3.5 h-3.5" />
			</Link>

			{/* Render / {workspace toggle} ONLY when on a workspace route */}
			{currentWorkspace !== null && (
				<>
					<span className="text-[#3f3f46] text-xs font-light select-none">
						/
					</span>

					<div className="relative" ref={workspaceRef}>
						<button
							ref={workspaceTriggerRef}
							type="button"
							onClick={() => {
								setIsWorkspaceOpen((prev) => !prev);
								setIsProjectOpen(false);
							}}
							className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-[#c4c4cc] hover:text-[#f4f4f5] hover:bg-white/[0.05] transition-colors cursor-pointer"
							aria-haspopup="menu"
							aria-expanded={isWorkspaceOpen}
							aria-label={`Workspace: ${currentWorkspace.name}`}
						>
							<span className="truncate max-w-[140px]">
								{currentWorkspace.name}
							</span>
							<ChevronDown className="w-3 h-3 text-[#71717a]" />
						</button>

						{isWorkspaceOpen && (
							<div
								role="menu"
								aria-label="Select Workspace"
								className="absolute left-0 top-full mt-1.5 w-52 rounded-xl bg-[#18181f] shadow-2xl p-1 z-50 text-xs"
							>
								<div className="px-2.5 py-1.5 text-[10px] uppercase font-semibold text-[#71717a] tracking-wider">
									Workspaces
								</div>
								{MOCK_WORKSPACES.map((w) => {
									const isSelected = w.id === currentWorkspace.id;
									return (
										<button
											key={w.id}
											type="button"
											role="menuitem"
											onClick={() => {
												setIsWorkspaceOpen(false);
												navigate({
													to: "/ws/$workspaceId",
													params: { workspaceId: w.id },
												});
											}}
											className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
												isSelected
													? "bg-white/[0.08] text-white font-medium"
													: "text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]"
											}`}
										>
											<span className="truncate">{w.name}</span>
											{isSelected && (
												<Check className="w-3.5 h-3.5 text-white" />
											)}
										</button>
									);
								})}
								<div className="my-1 h-px bg-white/[0.06]" />
								<button
									type="button"
									role="menuitem"
									onClick={() => {
										setIsWorkspaceOpen(false);
										workspaceTriggerRef.current?.focus();
									}}
									className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
								>
									<Plus className="w-3.5 h-3.5 text-[#71717a]" />
									<span>Create Workspace</span>
								</button>
							</div>
						)}
					</div>
				</>
			)}

			{/* Render / {project toggle} ONLY when on a project route */}
			{currentWorkspace !== null && currentProject !== null && (
				<>
					<span className="text-[#3f3f46] text-xs font-light select-none">
						/
					</span>

					<div className="relative" ref={projectRef}>
						<button
							ref={projectTriggerRef}
							type="button"
							onClick={() => {
								setIsProjectOpen((prev) => !prev);
								setIsWorkspaceOpen(false);
							}}
							className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-[#c4c4cc] hover:text-[#f4f4f5] hover:bg-white/[0.05] transition-colors cursor-pointer"
							aria-haspopup="menu"
							aria-expanded={isProjectOpen}
							aria-label={`Project: ${currentProject.name}`}
						>
							<span className="truncate max-w-[130px]">
								{currentProject.name}
							</span>
							<ChevronDown className="w-3 h-3 text-[#71717a]" />
						</button>

						{isProjectOpen && (
							<div
								role="menu"
								aria-label="Select Project"
								className="absolute left-0 top-full mt-1.5 w-48 rounded-xl bg-[#18181f] shadow-2xl p-1 z-50 text-xs"
							>
								<div className="px-2.5 py-1.5 text-[10px] uppercase font-semibold text-[#71717a] tracking-wider">
									Projects in this Workspace
								</div>
								{availableProjects.length > 0 ? (
									availableProjects.map((p) => {
										const isSelected = p.id === currentProject.id;
										return (
											<button
												key={p.id}
												type="button"
												role="menuitem"
												onClick={() => {
													setIsProjectOpen(false);
													navigate({
														to: "/ws/$workspaceId/p/$projectId",
														params: {
															workspaceId: currentWorkspace.id,
															projectId: p.id,
														},
													});
												}}
												className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
													isSelected
														? "bg-white/[0.08] text-white font-medium"
														: "text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]"
												}`}
											>
												<span className="truncate">{p.name}</span>
												{isSelected && (
													<Check className="w-3.5 h-3.5 text-white" />
												)}
											</button>
										);
									})
								) : (
									<div className="px-2.5 py-2 text-xs text-[#71717a]">
										No other projects
									</div>
								)}
							</div>
						)}
					</div>
				</>
			)}
		</nav>
	);
}
