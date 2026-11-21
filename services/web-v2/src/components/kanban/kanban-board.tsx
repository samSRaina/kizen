import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { Project, Ticket, TicketStatus, TicketType } from "#/lib/types";
import { KanbanColumn } from "./kanban-column";

interface KanbanBoardProps {
	project: Project;
	initialTickets: Ticket[];
}

const COLUMNS: { id: TicketStatus; title: string }[] = [
	{ id: "backlog", title: "Backlog" },
	{ id: "progress", title: "In Progress" },
	{ id: "paused", title: "Paused" },
	{ id: "review", title: "In Review" },
	{ id: "done", title: "Done" },
];

export function KanbanBoard({ project, initialTickets }: KanbanBoardProps) {
	const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState<TicketType | "all">("all");

	// Pragmatic Drag and Drop monitor across all cards and columns
	useEffect(() => {
		return monitorForElements({
			onDrop({ source, location }) {
				const destination = location.current.dropTargets[0];
				if (!destination) return;

				const sourceData = source.data;
				if (sourceData.type !== "ticket") return;

				const draggedTicket = sourceData.ticket as Ticket;
				const destinationData = destination.data;

				// Case 1: Dropped onto another ticket card
				if (destinationData.type === "ticket") {
					const targetTicket = destinationData.ticket as Ticket;
					const targetColumnId = destinationData.columnId as TicketStatus;
					const closestEdge = extractClosestEdge(destinationData);

					if (draggedTicket.id === targetTicket.id) return;

					setTickets((prev) => {
						const filtered = prev.filter((t) => t.id !== draggedTicket.id);
						const updatedTicket: Ticket = {
							...draggedTicket,
							status: targetColumnId,
							updated_at: new Date().toISOString(),
						};

						const targetIndex = filtered.findIndex(
							(t) => t.id === targetTicket.id,
						);
						if (targetIndex === -1) {
							return [...filtered, updatedTicket];
						}

						const insertIndex =
							closestEdge === "bottom" ? targetIndex + 1 : targetIndex;

						const next = [...filtered];
						next.splice(insertIndex, 0, updatedTicket);
						return next;
					});
					return;
				}

				// Case 2: Dropped onto an empty column or column area
				if (destinationData.type === "column") {
					const targetColumnId = destinationData.columnId as TicketStatus;

					setTickets((prev) => {
						const filtered = prev.filter((t) => t.id !== draggedTicket.id);
						const updatedTicket: Ticket = {
							...draggedTicket,
							status: targetColumnId,
							updated_at: new Date().toISOString(),
						};
						return [...filtered, updatedTicket];
					});
				}
			},
		});
	}, []);

	// Add new ticket directly into a column
	const handleAddTicket = (title: string, status: TicketStatus) => {
		const newTicket: Ticket = {
			id: `tkt_${Date.now()}`,
			project_id: project.id,
			identifier: `${project.ticket_id_prefix}-${Math.floor(100 + Math.random() * 900)}`,
			title,
			description: "",
			type: "task",
			status,
			priority: "Medium",
			category: "Development",
			tags: ["task"],
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		setTickets((prev) => [...prev, newTicket]);
	};

	// Inline ticket updates (title, description, priority)
	const handleUpdateTicket = (updatedTicket: Ticket) => {
		setTickets((prev) =>
			prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
		);
	};

	// Filter tickets according to search query and type filter
	const filteredTickets = tickets.filter((t) => {
		const matchesSearch =
			!searchQuery ||
			t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.category?.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesType = typeFilter === "all" || t.type === typeFilter;

		return matchesSearch && matchesType;
	});

	return (
		<div className="w-full flex flex-col gap-6 select-none">
			{/* Top Bar: Search board + Filter buttons */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div className="flex items-center gap-2.5 flex-wrap">
					{/* Search input */}
					<div className="relative flex items-center">
						<Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 pointer-events-none" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search board"
							className="h-8 pl-8 pr-3 rounded-lg bg-[#111114] hover:bg-[#15151a] focus:bg-[#18181f] text-xs text-[#ededef] placeholder-[#71717a] border-none outline-none transition-colors w-44 sm:w-56"
						/>
					</div>

					{/* Quick Type Filter pills */}
					<div className="flex items-center gap-1 bg-[#111114] p-0.5 rounded-lg">
						{(["all", "feature", "bug", "task"] as const).map((type) => (
							<button
								key={type}
								type="button"
								onClick={() => setTypeFilter(type)}
								className={`h-7 px-2.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
									typeFilter === type
										? "bg-white/[0.08] text-white"
										: "text-[#71717a] hover:text-[#d4d4d8]"
								}`}
							>
								{type === "all" ? "All types" : type}
							</button>
						))}
					</div>
				</div>

				<div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-[#8e8e96]">
					<span className="px-2.5 py-1 rounded-full bg-[#111114]">
						{filteredTickets.length}{" "}
						{filteredTickets.length === 1 ? "task" : "tasks"}
					</span>
				</div>
			</div>

			{/* Kanban Columns (Horizontal Scroll, Seamless Surfaces) */}
			<div className="w-full overflow-x-auto pb-4 flex items-start gap-4">
				{COLUMNS.map((col) => {
					const columnTickets = filteredTickets.filter(
						(t) => t.status === col.id,
					);
					return (
						<KanbanColumn
							key={col.id}
							id={col.id}
							title={col.title}
							tickets={columnTickets}
							onAddTicket={handleAddTicket}
							onUpdateTicket={handleUpdateTicket}
						/>
					);
				})}

				{/* Add column placeholder pill */}
				<button
					type="button"
					onClick={() => {
						console.log("Add custom column workflow");
					}}
					title="Add column"
					className="w-10 h-10 rounded-2xl bg-[#111114] hover:bg-[#18181f] flex items-center justify-center text-[#71717a] hover:text-[#f4f4f5] transition-colors shrink-0 mt-1 cursor-pointer"
				>
					<Plus className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
}
