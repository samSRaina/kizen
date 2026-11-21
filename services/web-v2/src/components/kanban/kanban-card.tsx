import {
	draggable,
	dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
	attachClosestEdge,
	type Edge,
	extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import {
	Bookmark,
	Bug,
	Check,
	CheckSquare,
	ChevronDown,
	ChevronsDown,
	ChevronsUp,
	ChevronUp,
	Equal,
	MoreHorizontal,
	Pencil,
	X,
} from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import type { Ticket, TicketPriority, TicketType } from "#/lib/types";

interface KanbanCardProps {
	ticket: Ticket;
	columnId: string;
	onUpdateTicket?: (ticket: Ticket) => void;
}

const PRIORITIES: {
	id: TicketPriority;
	label: string;
	icon: typeof Equal;
	color: string;
}[] = [
	{ id: "Highest", label: "Highest", icon: ChevronsUp, color: "text-rose-500" },
	{ id: "High", label: "High", icon: ChevronUp, color: "text-rose-400" },
	{ id: "Medium", label: "Medium", icon: Equal, color: "text-amber-500" },
	{ id: "Low", label: "Low", icon: ChevronDown, color: "text-sky-400" },
	{ id: "Lowest", label: "Lowest", icon: ChevronsDown, color: "text-sky-500" },
];

export function KanbanCard({
	ticket,
	columnId,
	onUpdateTicket,
}: KanbanCardProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

	// Priority dropdown state
	const [isPriorityOpen, setIsPriorityOpen] = useState(false);
	const priorityRef = useRef<HTMLDivElement>(null);

	// Inline editing state
	const [isEditing, setIsEditing] = useState(false);
	const [editTitle, setEditTitle] = useState(ticket.title);
	const [editDescription, setEditDescription] = useState(
		ticket.description || "",
	);
	const titleInputRef = useRef<HTMLInputElement>(null);
	const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		const element = ref.current;
		if (!element || isEditing) return;

		const cleanDraggable = draggable({
			element,
			getInitialData: () => ({
				type: "ticket",
				ticket,
				columnId,
			}),
			onDragStart: () => setIsDragging(true),
			onDrop: () => {
				setIsDragging(false);
				setClosestEdge(null);
			},
		});

		const cleanDropTarget = dropTargetForElements({
			element,
			canDrop: ({ source }) => {
				return source.data.type === "ticket";
			},
			getData: ({ input }) => {
				return attachClosestEdge(
					{
						type: "ticket",
						ticket,
						columnId,
					},
					{
						input,
						element,
						allowedEdges: ["top", "bottom"],
					},
				);
			},
			onDragEnter: ({ self }) => {
				const edge = extractClosestEdge(self.data);
				setClosestEdge(edge);
			},
			onDrag: ({ self }) => {
				const edge = extractClosestEdge(self.data);
				setClosestEdge(edge);
			},
			onDragLeave: () => {
				setClosestEdge(null);
			},
			onDrop: () => {
				setClosestEdge(null);
			},
		});

		return () => {
			cleanDraggable();
			cleanDropTarget();
		};
	}, [ticket, columnId, isEditing]);

	// Close priority menu on outside click or escape
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				priorityRef.current &&
				!priorityRef.current.contains(e.target as Node)
			) {
				setIsPriorityOpen(false);
			}
		}
		function handleKeyDown(e: globalThis.KeyboardEvent) {
			if (e.key === "Escape") {
				setIsPriorityOpen(false);
				if (isEditing) {
					setIsEditing(false);
					setEditTitle(ticket.title);
					setEditDescription(ticket.description || "");
				}
			}
		}

		if (isPriorityOpen || isEditing) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleKeyDown);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isPriorityOpen, isEditing, ticket.title, ticket.description]);

	// Focus title input when entering edit mode
	useEffect(() => {
		if (isEditing) {
			titleInputRef.current?.focus();
			titleInputRef.current?.select();
		}
	}, [isEditing]);

	// Save inline edit (simulates REST PATCH request)
	const handleSaveEdit = () => {
		if (editTitle.trim()) {
			const updated: Ticket = {
				...ticket,
				title: editTitle.trim(),
				description: editDescription.trim() || null,
				updated_at: new Date().toISOString(),
			};
			console.log("PATCH /ws/:workspace_id/p/:project_id/tickets/:id", updated);
			onUpdateTicket?.(updated);
			setIsEditing(false);
		}
	};

	const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			// Cascade focus to description input
			descriptionInputRef.current?.focus();
		}
	};

	const handleDescriptionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			// Final enter saves the output
			handleSaveEdit();
		}
	};

	const handleSelectPriority = (priority: TicketPriority) => {
		const updated: Ticket = {
			...ticket,
			priority,
			updated_at: new Date().toISOString(),
		};
		console.log(
			"PATCH /ws/:workspace_id/p/:project_id/tickets/:id (priority)",
			updated,
		);
		onUpdateTicket?.(updated);
		setIsPriorityOpen(false);
	};

	// Priority visual icon
	const renderPriorityIcon = (priority: TicketPriority) => {
		switch (priority) {
			case "Highest":
			case "Critical":
				return (
					<ChevronsUp className="w-3.5 h-3.5 stroke-[2.5] text-rose-500" />
				);
			case "High":
				return <ChevronUp className="w-3.5 h-3.5 stroke-[2.5] text-rose-400" />;
			case "Medium":
				return <Equal className="w-3.5 h-3.5 stroke-[2.5] text-amber-500" />;
			case "Lowest":
				return (
					<ChevronsDown className="w-3.5 h-3.5 stroke-[2.5] text-sky-500" />
				);
			default:
				return (
					<ChevronDown className="w-3.5 h-3.5 stroke-[2.5] text-sky-400" />
				);
		}
	};

	// Type icon indicator
	const renderTypeIcon = (type: TicketType) => {
		switch (type) {
			case "bug":
				return (
					<span
						title="Bug issue"
						className="w-4 h-4 rounded bg-rose-950/60 flex items-center justify-center text-rose-400 shrink-0"
					>
						<Bug className="w-2.5 h-2.5" />
					</span>
				);
			case "feature":
				return (
					<span
						title="Feature story"
						className="w-4 h-4 rounded bg-emerald-950/60 flex items-center justify-center text-emerald-400 shrink-0"
					>
						<Bookmark className="w-2.5 h-2.5 fill-current" />
					</span>
				);
			default:
				return (
					<span
						title="Task item"
						className="w-4 h-4 rounded bg-sky-950/60 flex items-center justify-center text-sky-400 shrink-0"
					>
						<CheckSquare className="w-2.5 h-2.5" />
					</span>
				);
		}
	};

	return (
		<div className="relative group w-full">
			{/* Top drop target indicator line */}
			{closestEdge === "top" && (
				<div className="absolute -top-1.5 left-0 right-0 h-1 bg-emerald-400 rounded-full z-20 pointer-events-none shadow-sm shadow-emerald-400/50" />
			)}

			<div
				ref={ref}
				className={`relative w-full bg-[#18181f] hover:bg-[#202029] rounded-xl p-3.5 transition-all duration-150 text-left select-none flex flex-col gap-2.5 shadow-sm ${
					isEditing
						? "cursor-default ring-1 ring-white/10"
						: "cursor-grab active:cursor-grabbing"
				} ${isDragging ? "opacity-30 scale-95" : "opacity-100"}`}
			>
				{/* INLINE EDITING MODE */}
				{isEditing ? (
					<div className="w-full flex flex-col gap-2">
						<div className="flex items-center justify-between text-[#8e8e96] pb-1">
							<span className="text-[10px] uppercase font-mono tracking-wider">
								Editing {ticket.identifier}
							</span>
							<button
								type="button"
								onClick={() => {
									setIsEditing(false);
									setEditTitle(ticket.title);
									setEditDescription(ticket.description || "");
								}}
								className="p-1 hover:text-white rounded transition-colors cursor-pointer"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						</div>

						{/* Title input: Enter cascades to description */}
						<input
							ref={titleInputRef}
							type="text"
							value={editTitle}
							onChange={(e) => setEditTitle(e.target.value)}
							onKeyDown={handleTitleKeyDown}
							placeholder="Ticket title (Enter to description)..."
							className="w-full bg-[#111114] text-[13px] font-medium text-[#ededef] px-2.5 py-1.5 rounded-lg border-none outline-none focus:ring-1 focus:ring-emerald-500/50"
						/>

						{/* Description input: Enter saves */}
						<textarea
							ref={descriptionInputRef}
							rows={2}
							value={editDescription}
							onChange={(e) => setEditDescription(e.target.value)}
							onKeyDown={handleDescriptionKeyDown}
							placeholder="Add description (Enter to save)..."
							className="w-full bg-[#111114] text-xs text-[#a1a1aa] px-2.5 py-1.5 rounded-lg border-none outline-none resize-none focus:ring-1 focus:ring-emerald-500/50"
						/>

						<div className="flex items-center justify-end pt-1">
							<button
								type="button"
								onClick={handleSaveEdit}
								disabled={!editTitle.trim()}
								className="h-6 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-medium text-white transition-all cursor-pointer"
							>
								Save
							</button>
						</div>
					</div>
				) : (
					/* DEFAULT CARD DISPLAY MODE */
					<>
						{/* Top row: Clickable Title + Quick actions */}
						<div className="w-full flex items-start justify-between gap-2">
							<button
								type="button"
								onClick={() => setIsEditing(true)}
								className="text-[13px] font-medium text-[#ededef] group-hover:text-white leading-snug line-clamp-2 text-left cursor-pointer hover:underline"
							>
								{ticket.title}
							</button>

							<div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 text-[#71717a] transition-opacity shrink-0">
								<button
									type="button"
									title="Edit ticket inline"
									onClick={(e) => {
										e.stopPropagation();
										setIsEditing(true);
									}}
									className="p-1 hover:text-white hover:bg-white/[0.06] rounded transition-colors cursor-pointer"
								>
									<Pencil className="w-3 h-3" />
								</button>
								<button
									type="button"
									title="More options"
									onClick={(e) => {
										e.stopPropagation();
									}}
									className="p-1 hover:text-white hover:bg-white/[0.06] rounded transition-colors cursor-pointer"
								>
									<MoreHorizontal className="w-3 h-3" />
								</button>
							</div>
						</div>

						{/* Optional Description / Category snippet */}
						{ticket.description ? (
							<p className="text-[11px] text-[#a1a1aa] line-clamp-2 leading-relaxed">
								{ticket.description}
							</p>
						) : ticket.category ? (
							<p className="text-[11px] text-[#8e8e96] italic truncate">
								{ticket.category}
							</p>
						) : null}

						{/* Bottom row: Type Icon + Identifier + Priority Toggle Button */}
						<div className="w-full flex items-center justify-between pt-1">
							<div className="flex items-center gap-1.5">
								{renderTypeIcon(ticket.type)}
								<span className="font-mono text-[11px] font-medium text-[#a1a1aa] tracking-tight">
									{ticket.identifier}
								</span>
							</div>

							{/* Priority Toggle Dropdown (without search bar, matching image 1) */}
							<div className="relative" ref={priorityRef}>
								<button
									type="button"
									title={`Priority: ${ticket.priority} (Click to change)`}
									onClick={(e) => {
										e.stopPropagation();
										setIsPriorityOpen((prev) => !prev);
									}}
									className="flex items-center p-1 rounded-md hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors cursor-pointer"
								>
									{renderPriorityIcon(ticket.priority)}
								</button>

								{/* Dropdown menu without search bar */}
								{isPriorityOpen && (
									<div
										role="listbox"
										aria-label="Select priority"
										className="absolute right-0 bottom-full mb-1.5 w-36 rounded-xl bg-[#1c1c24] shadow-2xl p-1 z-50 text-xs flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
									>
										{PRIORITIES.map((p) => {
											const isSelected = ticket.priority === p.id;
											const IconComponent = p.icon;
											return (
												<button
													key={p.id}
													type="button"
													role="option"
													aria-selected={isSelected}
													onClick={(e) => {
														e.stopPropagation();
														handleSelectPriority(p.id);
													}}
													className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
														isSelected
															? "bg-blue-600/80 text-white font-medium"
															: "text-[#d4d4d8] hover:bg-white/[0.06] hover:text-white"
													}`}
												>
													<div className="flex items-center gap-2">
														<IconComponent
															className={`w-3.5 h-3.5 stroke-[2.5] ${
																isSelected ? "text-white" : p.color
															}`}
														/>
														<span>{p.label}</span>
													</div>
													{isSelected && (
														<Check className="w-3 h-3 text-white" />
													)}
												</button>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</>
				)}
			</div>

			{/* Bottom drop target indicator line */}
			{closestEdge === "bottom" && (
				<div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-emerald-400 rounded-full z-20 pointer-events-none shadow-sm shadow-emerald-400/50" />
			)}
		</div>
	);
}
