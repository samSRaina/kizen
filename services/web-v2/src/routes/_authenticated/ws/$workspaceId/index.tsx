import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Briefcase, ChevronDown, FolderGit2, Sparkles } from "lucide-react";
import { useState } from "react";
import { ReferenceBanner } from "#/components/common/reference-banner";
import { ReferenceCard } from "#/components/common/reference-card";
import { MOCK_PROJECTS, MOCK_WORKSPACES } from "#/lib/mock-data";
import type { Project } from "#/lib/types";

export const Route = createFileRoute("/_authenticated/ws/$workspaceId/")({
	component: WorkspaceDetailPage,
});

function WorkspaceDetailPage() {
	const { workspaceId } = Route.useParams();
	const navigate = useNavigate();

	const workspace = MOCK_WORKSPACES.find((w) => w.id === workspaceId) ?? {
		id: workspaceId,
		owner_id: "usr_skylar",
		name: workspaceId,
		default_hourly_rate: 120,
		category: "Active Workspace",
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};

	const workspaceProjects = MOCK_PROJECTS.filter(
		(p) => p.workspace_id === workspace.id,
	);

	const [showAllProjects, setShowAllProjects] = useState(false);
	const displayedProjects = showAllProjects
		? workspaceProjects
		: workspaceProjects.slice(0, 6);

	const handleSelectProject = (project: Project) => {
		navigate({
			to: "/ws/$workspaceId/p/$projectId",
			params: {
				workspaceId: workspace.id,
				projectId: project.id,
			},
		});
	};

	return (
		<div className="h-full w-full overflow-y-auto px-4 sm:px-8 pt-8 pb-12 max-w-5xl mx-auto flex flex-col gap-9">
			{/* Header: Icon + Title + Metadata pill (seamless, no borders) */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<div className="w-11 h-11 rounded-2xl bg-[#1d4ed8]/20 flex items-center justify-center text-[#60a5fa] shadow-lg shadow-blue-950/20 shrink-0">
						<Briefcase className="w-5 h-5" />
					</div>

					<div>
						<h1 className="text-2xl sm:text-3xl font-semibold text-[#f4f4f5] tracking-tight">
							{workspace.name}
						</h1>
						<p className="text-xs text-[#8e8e96] mt-0.5">
							{workspace.description ||
								"Workspace overview and client projects."}
						</p>
					</div>
				</div>

				{/* Right metadata badges pill (seamless) */}
				<div className="flex items-center gap-2 self-start sm:self-auto">
					<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16161b] text-xs font-medium text-[#d4d4d8]">
						<span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />$
							{workspace.default_hourly_rate}/hr
						</span>
						<span className="text-[#3f3f46]">·</span>
						<span className="text-[#a1a1aa] font-mono text-[11px]">
							{workspaceProjects.length}{" "}
							{workspaceProjects.length === 1 ? "project" : "projects"}
						</span>
					</div>
				</div>
			</div>

			{/* All projects Section (seamless card grid, no top priorities) */}
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between px-0.5">
					<h2 className="text-xs font-medium uppercase tracking-wider text-[#8e8e96]">
						All projects
					</h2>
					<span className="text-[11px] text-[#71717a] font-mono">
						{workspaceProjects.length} total
					</span>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
					{displayedProjects.map((project) => (
						<ReferenceCard
							key={project.id}
							category={`${project.ticket_id_prefix} · ${project.category || "Active Project"}`}
							title={project.name}
							description={
								project.description || "Project specifications & tickets."
							}
							badgeText={`$${project.default_hourly_rate}/hr baseline`}
							badgeVariant="default"
							badgeIcon={<FolderGit2 className="w-3 h-3 text-[#71717a]" />}
							onClick={() => handleSelectProject(project)}
						/>
					))}
				</div>

				{workspaceProjects.length > 6 && (
					<div className="flex justify-center pt-1">
						<button
							type="button"
							onClick={() => setShowAllProjects((prev) => !prev)}
							className="text-xs text-[#8e8e96] hover:text-[#f4f4f5] flex items-center gap-1 transition-colors cursor-pointer"
						>
							<span>{showAllProjects ? "Show less" : "See more"}</span>
							<ChevronDown
								className={`w-3.5 h-3.5 transition-transform ${
									showAllProjects ? "rotate-180" : ""
								}`}
							/>
						</button>
					</div>
				)}
			</div>

			{/* Seamless Action Banner Card */}
			<ReferenceBanner
				title="Accelerate your freelance operations"
				description="Organize projects, manage milestone delivery, and track time against client agreements."
				buttonText="Open Tracking Ledger"
				icon={<Sparkles className="w-5 h-5 text-emerald-400" />}
				onButtonClick={() =>
					navigate({
						to: "/ws/$workspaceId/track",
						params: { workspaceId: workspace.id },
					})
				}
			/>
		</div>
	);
}
