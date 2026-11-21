import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { MoreHorizontal, Plus, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import type { Ticket, TicketStatus } from "#/lib/types";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
	id: TicketStatus;
	title: string;
	tickets: Ticket[];
	onAddTicket: (title: string, status: TicketStatus) => void;
	onUpdateTicket?: (ticket: Ticket) => void;
}

export function KanbanColumn({
	id,
	title,
	tickets,
	onAddTicket,
	onUpdateTicket,
}: KanbanColumnProps) {
	const columnRef = useRef<HTMLDivElement>(null);
	const [isOver, setIsOver] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const element = columnRef.current;
		if (!element) return;

		return dropTargetForElements({
			element,
			canDrop: ({ source }) => {
				return source.data.type === "ticket";
			},
			getData: () => ({
				type: "column",
				columnId: id,
			}),
			onDragEnter: () => setIsOver(true),
			onDragLeave: () => setIsOver(false),
			onDrop: () => setIsOver(false),
		});
	}, [id]);

	useEffect(() => {
		if (isAdding) {
			inputRef.current?.focus();
		}
	}, [isAdding]);

	const handleCreateTicket = () => {
		if (newTitle.trim()) {
			onAddTicket(newTitle.trim(), id);
			setNewTitle("");
			setIsAdding(false);
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleCreateTicket();
		} else if (e.key === "Escape") {
			setIsAdding(false);
			setNewTitle("");
		}
	};

	return (
		<div
			ref={columnRef}
			className={`w-[290px] shrink-0 bg-[#111114] rounded-2xl p-2.5 flex flex-col gap-2 h-fit transition-colors duration-150 select-none ${
				isOver ? "bg-[#16161d]" : "bg-[#111114]"
			}`}
		>
			{/* Column Header: Title + Count + Actions */}
			<div className="flex items-center justify-between px-1.5 py-1 text-[#8e8e96]">
				<div className="flex items-center gap-2">
					<h3 className="text-xs font-semibold text-[#ededef] tracking-wide">
						{title}
					</h3>
					<span className="text-[11px] font-mono font-medium text-[#71717a] px-1.5 py-0.2 rounded-full bg-white/[0.04]">
						{tickets.length}
					</span>
				</div>

				<div className="flex items-center gap-1">
					<button
						type="button"
						title="Column actions"
						className="p-1 hover:text-white hover:bg-white/[0.04] rounded transition-colors cursor-pointer"
					>
						<MoreHorizontal className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>

			{/* Card List (only rendered if has items) */}
			{tickets.length > 0 && (
				<div className="flex flex-col gap-2 w-full">
					{tickets.map((ticket) => (
						<KanbanCard
							key={ticket.id}
							ticket={ticket}
							columnId={id}
							onUpdateTicket={onUpdateTicket}
						/>
					))}
				</div>
			)}

			{/* Inline Quick Create button sticks directly to cards (or to header if 0 tasks) */}
			<div className="w-full">
				{isAdding ? (
					<div className="w-full bg-[#18181f] rounded-xl p-2.5 flex flex-col gap-2 shadow-lg animate-in fade-in duration-100">
						<input
							ref={inputRef}
							type="text"
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="What needs to be done?"
							className="w-full bg-[#111114] text-xs text-[#ededef] placeholder-[#71717a] px-2.5 py-1.5 rounded-lg border-none outline-none focus:ring-1 focus:ring-emerald-500/50"
						/>
						<div className="flex items-center justify-between pt-1">
							<button
								type="button"
								onClick={handleCreateTicket}
								disabled={!newTitle.trim()}
								className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-white transition-all cursor-pointer"
							>
								Add task
							</button>
							<button
								type="button"
								onClick={() => {
									setIsAdding(false);
									setNewTitle("");
								}}
								className="p-1 text-[#71717a] hover:text-[#f4f4f5] rounded transition-colors cursor-pointer"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						</div>
					</div>
				) : (
					<button
						type="button"
						onClick={() => setIsAdding(true)}
						className="w-full py-2 px-2.5 rounded-xl bg-[#15151a] hover:bg-[#1a1a22] active:bg-[#1f1f28] text-[#8e8e96] hover:text-[#ededef] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
					>
						<Plus className="w-3.5 h-3.5 text-[#71717a]" />
						<span>What needs to be done?</span>
					</button>
				)}
			</div>
		</div>
	);
}
