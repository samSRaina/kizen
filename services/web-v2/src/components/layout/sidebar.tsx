import { Link, useLocation } from "@tanstack/react-router";
import { Activity, Briefcase, FolderPlus, Settings } from "lucide-react";
import { MOCK_PROJECTS } from "#/lib/mock-data";

interface SidebarProps {
	id?: string;
	isOpen: boolean;
	onOpenSettings?: () => void;
}

export function Sidebar({
	id = "app-sidebar",
	isOpen,
	onOpenSettings,
}: SidebarProps) {
	const location = useLocation();
	const matchWs = location.pathname.match(/^\/ws\/([^/]+)/);
	const activeWorkspaceId = matchWs ? matchWs[1] : "personal";

	const matchProj = location.pathname.match(/^\/ws\/[^/]+\/p\/([^/]+)/);
	const activeProjectId = matchProj ? matchProj[1] : null;

	const projects = MOCK_PROJECTS.filter(
		(p) => p.workspace_id === activeWorkspaceId,
	);

	return (
		<aside
			id={id}
			className={`fixed top-9 bottom-0 left-0 z-30 w-[210px] bg-[#111114] flex flex-col justify-between select-none transition-transform duration-200 ease-in-out ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			}`}
			aria-label="Application Sidebar"
			aria-hidden={!isOpen}
		>
			{/* Top Navigation Links */}
			<div className="flex flex-col p-2.5 gap-2.5">
				<nav className="flex flex-col gap-0.5">
					<Link
						to="/ws/$workspaceId/track"
						params={{ workspaceId: activeWorkspaceId }}
						className="w-full h-7 px-2 rounded-md text-xs text-[#c4c4cc] hover:text-[#f4f4f5] hover:bg-white/[0.04] flex items-center gap-2.5 transition-colors cursor-pointer text-left"
					>
						<Activity className="w-3.5 h-3.5 text-[#8e8e96]" />
						<span>Tracking</span>
					</Link>
					<Link
						to="/ws"
						className="w-full h-7 px-2 rounded-md text-xs text-[#c4c4cc] hover:text-[#f4f4f5] hover:bg-white/[0.04] flex items-center gap-2.5 transition-colors cursor-pointer text-left"
					>
						<Briefcase className="w-3.5 h-3.5 text-[#8e8e96]" />
						<span>Workspaces</span>
					</Link>
					<button
						type="button"
						className="w-full h-7 px-2 rounded-md text-xs text-[#c4c4cc] hover:text-[#f4f4f5] hover:bg-white/[0.04] flex items-center gap-2.5 transition-colors cursor-pointer text-left"
					>
						<svg
							viewBox="0 0 16 16"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="w-3.5 h-3.5 text-[#8e8e96]"
							role="img"
							aria-label="Customizations"
						>
							<title>Customizations</title>
							<rect
								x="2"
								y="5"
								width="12"
								height="8"
								rx="1.5"
								stroke="currentColor"
								strokeWidth="1.2"
							/>
							<path
								d="M5.5 5V3.5C5.5 2.67 6.17 2 7 2H9C9.83 2 10.5 2.67 10.5 3.5V5"
								stroke="currentColor"
								strokeWidth="1.2"
							/>
							<line
								x1="2"
								y1="8"
								x2="14"
								y2="8"
								stroke="currentColor"
								strokeWidth="1.2"
							/>
						</svg>
						<span>Customizations</span>
					</button>
				</nav>

				{/* Projects Section */}
				<div className="pt-2 flex flex-col">
					<div className="flex items-center justify-between px-2 py-1 text-[#71717a]">
						<span className="text-[11px] font-normal tracking-wide">
							Projects
						</span>
						<button
							type="button"
							title="New project"
							aria-label="New project"
							className="hover:text-white transition-colors cursor-pointer p-0.5 rounded"
						>
							<FolderPlus className="w-3 h-3 text-[#71717a]" />
						</button>
					</div>

					<div className="flex flex-col gap-0.5 mt-1">
						{projects.map((proj) => {
							const isActive = activeProjectId === proj.id;
							return (
								<Link
									key={proj.id}
									to="/ws/$workspaceId/p/$projectId"
									params={{
										workspaceId: activeWorkspaceId,
										projectId: proj.id,
									}}
									className={`w-full h-7 px-2 rounded-md text-xs flex items-center gap-2 transition-colors cursor-pointer text-left truncate ${
										isActive
											? "bg-white/[0.08] text-white font-medium"
											: "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.04]"
									}`}
								>
									<span className="font-mono text-[10px] text-[#71717a]">
										{proj.ticket_id_prefix}
									</span>
									<span className="truncate">{proj.name}</span>
								</Link>
							);
						})}
					</div>
				</div>
			</div>

			{/* Bottom Pinned Settings */}
			<div className="p-2.5">
				<button
					type="button"
					onClick={onOpenSettings}
					className="w-full h-7 px-2 rounded-md text-xs text-[#c4c4cc] hover:text-[#f4f4f5] hover:bg-white/[0.04] flex items-center gap-2.5 transition-colors cursor-pointer text-left"
				>
					<Settings className="w-3.5 h-3.5 text-[#8e8e96]" />
					<span>Settings</span>
				</button>
			</div>
		</aside>
	);
}
