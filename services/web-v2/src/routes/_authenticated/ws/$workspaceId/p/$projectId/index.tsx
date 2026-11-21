import { createFileRoute } from "@tanstack/react-router";
import { Check, Pencil, X } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import { KanbanBoard } from "#/components/kanban/kanban-board";
import { MOCK_PROJECTS, MOCK_TICKETS } from "#/lib/mock-data";
import type { Project } from "#/lib/types";

export const Route = createFileRoute(
	"/_authenticated/ws/$workspaceId/p/$projectId/",
)({
	component: ProjectKanbanPage,
});

function ProjectKanbanPage() {
	const { workspaceId, projectId } = Route.useParams();

	const initialProject = MOCK_PROJECTS.find(
		(p) => p.id === projectId && p.workspace_id === workspaceId,
	) ??
		MOCK_PROJECTS.find((p) => p.id === projectId) ?? {
			id: projectId,
			workspace_id: workspaceId,
			name: projectId,
			ticket_id_prefix: "PRJ",
			settings: {},
			default_hourly_rate: 110,
			description: "Project kanban board & sprint workflow.",
			category: "Active Development",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

	const [project, setProject] = useState<Project>(initialProject);
	const [isEditingHeader, setIsEditingHeader] = useState(false);
	const [editName, setEditName] = useState(project.name);
	const [editDescription, setEditDescription] = useState(
		project.description || "",
	);

	const titleInputRef = useRef<HTMLInputElement>(null);
	const descriptionInputRef = useRef<HTMLInputElement>(null);

	// Inline editing cascading Enter behavior
	const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			// Enter on title bar cascades to description bar
			descriptionInputRef.current?.focus();
			descriptionInputRef.current?.select();
		} else if (e.key === "Escape") {
			setIsEditingHeader(false);
			setEditName(project.name);
			setEditDescription(project.description || "");
		}
	};

	const handleDescriptionKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			// Final enter saves output and triggers REST PATCH request
			handleSaveHeader();
		} else if (e.key === "Escape") {
			setIsEditingHeader(false);
			setEditName(project.name);
			setEditDescription(project.description || "");
		}
	};

	const handleSaveHeader = () => {
		if (editName.trim()) {
			const updated: Project = {
				...project,
				name: editName.trim(),
				description: editDescription.trim() || null,
				updated_at: new Date().toISOString(),
			};
			// Simulate REST PATCH request
			console.log("PATCH /ws/:workspace_id/p/:id", updated);
			setProject(updated);
			setIsEditingHeader(false);
		}
	};

	// Tickets for this project
	const projectTickets = MOCK_TICKETS.filter(
		(t) => t.project_id === project.id,
	);
	const initialTickets =
		projectTickets.length > 0 ? projectTickets : MOCK_TICKETS.slice(0, 5);

	return (
		<div className="h-full w-full overflow-y-auto px-4 sm:px-8 pt-8 pb-12 flex flex-col gap-6">
			{/* Header: Clean Typography without Logo Emblem, Inline Editable Title and Description */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				{isEditingHeader ? (
					<div className="flex-1 max-w-2xl flex flex-col gap-2 bg-[#121216] p-3 rounded-2xl animate-in fade-in duration-150">
						<div className="flex items-center gap-2">
							<input
								ref={titleInputRef}
								type="text"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								onKeyDown={handleTitleKeyDown}
								placeholder="Project title (Enter to description)..."
								className="w-full bg-[#18181f] text-2xl font-semibold text-[#f4f4f5] px-3 py-1.5 rounded-xl border-none outline-none focus:ring-1 focus:ring-emerald-500/50"
							/>
							<button
								type="button"
								onClick={handleSaveHeader}
								className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shrink-0"
								title="Save changes"
							>
								<Check className="w-4 h-4" />
							</button>
							<button
								type="button"
								onClick={() => {
									setIsEditingHeader(false);
									setEditName(project.name);
									setEditDescription(project.description || "");
								}}
								className="p-2 rounded-xl bg-[#202029] hover:bg-[#282834] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer shrink-0"
								title="Cancel"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						<input
							ref={descriptionInputRef}
							type="text"
							value={editDescription}
							onChange={(e) => setEditDescription(e.target.value)}
							onKeyDown={handleDescriptionKeyDown}
							placeholder="Project description (Enter to save)..."
							className="w-full bg-[#18181f] text-xs text-[#a1a1aa] px-3 py-1.5 rounded-xl border-none outline-none focus:ring-1 focus:ring-emerald-500/50"
						/>
					</div>
				) : (
					<div className="group/hdr flex flex-col gap-0.5">
						<div className="flex items-center gap-2.5">
							<h1 className="text-2xl sm:text-3xl font-semibold text-[#f4f4f5] tracking-tight">
								{project.name}
							</h1>
							<button
								type="button"
								onClick={() => {
									setIsEditingHeader(true);
									setTimeout(() => {
										titleInputRef.current?.focus();
										titleInputRef.current?.select();
									}, 50);
								}}
								title="Edit project title & description"
								className="opacity-0 group-hover/hdr:opacity-100 p-1 rounded-md text-[#71717a] hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
							>
								<Pencil className="w-3.5 h-3.5" />
							</button>
						</div>
						<button
							type="button"
							onClick={() => {
								setIsEditingHeader(true);
								setTimeout(() => {
									descriptionInputRef.current?.focus();
								}, 50);
							}}
							className="text-left text-xs text-[#8e8e96] mt-0.5 cursor-pointer hover:text-[#d4d4d8] transition-colors"
						>
							{project.description || "Click to add project description..."}
						</button>
					</div>
				)}

				{/* Right metadata pill */}
				<div className="flex items-center gap-2 self-start sm:self-auto">
					<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16161b] text-xs font-medium text-[#d4d4d8]">
						<span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />$
							{project.default_hourly_rate}/hr
						</span>
					</div>
				</div>
			</div>

			{/* Kanban Board Component */}
			<KanbanBoard project={project} initialTickets={initialTickets} />
		</div>
	);
}
