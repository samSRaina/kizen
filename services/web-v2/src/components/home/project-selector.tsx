import { ChevronDown, FolderGit2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MOCK_PROJECTS } from "#/lib/mock-data";

interface ProjectSelectorProps {
	selectedProjectId?: string | null;
	onSelectProject?: (projectId: string | null) => void;
}

export function ProjectSelector({
	selectedProjectId,
	onSelectProject,
}: ProjectSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selectedProject = selectedProjectId
		? MOCK_PROJECTS.find((p) => p.id === selectedProjectId)
		: null;

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="relative inline-block" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-[#a1a1aa] hover:text-[#ededef] hover:bg-white/[0.04] transition-colors cursor-pointer select-none"
				aria-expanded={isOpen}
				aria-haspopup="listbox"
			>
				<FolderGit2 className="w-3.5 h-3.5 text-[#71717a]" />
				<span className="font-normal text-[12px] truncate max-w-[120px]">
					{selectedProject ? selectedProject.name : "No Project"}
				</span>
				<ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
			</button>

			{isOpen && (
				<div
					role="listbox"
					className="absolute left-0 top-full mt-1.5 w-48 rounded-lg bg-[#18181f] shadow-xl p-1 z-50 text-xs"
				>
					<button
						type="button"
						role="option"
						aria-selected={!selectedProjectId}
						onClick={() => {
							onSelectProject?.(null);
							setIsOpen(false);
						}}
						className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-white/[0.06] transition-colors ${
							!selectedProjectId ? "text-white font-medium" : "text-[#a1a1aa]"
						}`}
					>
						No Project
					</button>

					<div className="my-1 h-px bg-white/[0.06]" />

					{MOCK_PROJECTS.map((project) => (
						<button
							key={project.id}
							type="button"
							role="option"
							aria-selected={selectedProjectId === project.id}
							onClick={() => {
								onSelectProject?.(project.id);
								setIsOpen(false);
							}}
							className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-white/[0.06] transition-colors flex items-center justify-between ${
								selectedProjectId === project.id
									? "text-white font-medium"
									: "text-[#a1a1aa]"
							}`}
						>
							<span className="truncate">{project.name}</span>
							<span className="text-[10px] font-mono text-[#71717a]">
								{project.ticket_id_prefix}
							</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
