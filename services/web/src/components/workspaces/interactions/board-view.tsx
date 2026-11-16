import { Clock } from "lucide-react";
import { useState } from "react";
import type { Ticket, TicketPriority, TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AddTicketRow } from "./add-ticket-row";
import { TicketCard } from "./ticket-card";
import { DEFAULT_COLUMNS } from "./view-utils";

interface BoardViewProps {
	workspaceId: string;
	tickets: Ticket[];
	activeTimerTicketId?: string | null;
	onSelectTicket: (ticket: Ticket) => void;
	onStartTimer?: (ticketId: string) => void;
	onStatusChange: (
		ticketIdentifier: string,
		newStatus: TicketStatus,
	) => Promise<void>;
	onCreateTicket: (
		title: string,
		priority: TicketPriority,
		status: TicketStatus,
	) => Promise<void>;
	onDeleteTicket: (ticketIdentifier: string) => Promise<void>;
	onOpenCompletedModal: () => void;
	completedCount: number;
}

export function BoardView({
	tickets,
	activeTimerTicketId,
	onSelectTicket,
	onStartTimer,
	onStatusChange,
	onCreateTicket,
	onDeleteTicket,
	onOpenCompletedModal,
	completedCount,
}: BoardViewProps) {
	const [dragOverColumn, setDragOverColumn] = useState<TicketStatus | null>(
		null,
	);

	const handleDragStart = (e: React.DragEvent, identifier: string) => {
		e.dataTransfer.setData("text/plain", identifier);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDrop = async (e: React.DragEvent, targetStatus: TicketStatus) => {
		e.preventDefault();
		setDragOverColumn(null);
		const identifier = e.dataTransfer.getData("text/plain");
		if (!identifier) return;

		const ticket = tickets.find((t) => t.identifier === identifier);
		if (!ticket || ticket.status === targetStatus) return;

		await onStatusChange(identifier, targetStatus);
	};

	return (
		<div className="flex-1 h-full min-h-0 flex flex-col overflow-hidden gap-2.5 w-full select-none">
			{/* Top Bar with Completed Tickets Pill */}
			{completedCount > 0 && (
				<div className="shrink-0 flex items-center justify-end">
					<button
						type="button"
						onClick={onOpenCompletedModal}
						className="h-7 inline-flex items-center gap-1.5 px-2.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs border border-border-default bg-surface-base text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors cursor-pointer shadow-2xs"
					>
						<Clock className="size-3 text-emerald-600" />
						<span>Completed Tickets</span>
						<span className="px-1.5 py-0.2 rounded-xs bg-surface-elevated text-[10px] font-mono font-bold text-text-primary">
							{completedCount}
						</span>
					</button>
				</div>
			)}

			{/* 4-Column Responsive Kanban Grid: Spanning Vertically to Fit Desktop */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-1 h-full min-h-0 items-stretch overflow-hidden">
				{DEFAULT_COLUMNS.map((col) => {
					const colTickets = tickets.filter((t) => t.status === col.id);
					const isOver = dragOverColumn === col.id;

					return (
						// biome-ignore lint/a11y/noStaticElementInteractions: drag drop target column
						<div
							key={col.id}
							onDragOver={(e) => {
								e.preventDefault();
								e.dataTransfer.dropEffect = "move";
								if (dragOverColumn !== col.id) setDragOverColumn(col.id);
							}}
							onDragLeave={(e) => {
								if (!e.currentTarget.contains(e.relatedTarget as Node)) {
									setDragOverColumn(null);
								}
							}}
							onDrop={(e) => handleDrop(e, col.id)}
							className={cn(
								"flex flex-col h-full max-h-full rounded-xs border border-border-default bg-surface-base shadow-2xs overflow-hidden transition-colors duration-150",
								isOver &&
									"border-accent-primary ring-1 ring-accent-primary bg-surface-elevated/80",
							)}
						>
							{/* Column Header */}
							<div className="shrink-0 px-3 py-2 border-b border-border-default bg-surface-elevated/40 flex items-center justify-between select-none">
								<div className="flex items-center gap-2">
									<span
										className="size-2 rounded-xs"
										style={{ backgroundColor: col.dotColor }}
									/>
									<span className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
										{col.title}
									</span>
								</div>
								<span className="text-[11px] font-mono font-bold text-text-muted px-1.5 py-0.5 bg-surface-base border border-border-subtle rounded-xs">
									{colTickets.length}
								</span>
							</div>

							{/* Ticket Cards List: Pinned Vertical Scroll Inside Column */}
							<div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0 overscroll-contain">
								{colTickets.map((ticket) => (
									<TicketCard
										key={ticket.id}
										ticket={ticket}
										isTracking={activeTimerTicketId === ticket.id}
										onClick={() => onSelectTicket(ticket)}
										onStartTimer={
											onStartTimer ? () => onStartTimer(ticket.id) : undefined
										}
										onStatusChange={(newStatus) =>
											onStatusChange(ticket.identifier, newStatus)
										}
										onDelete={() => onDeleteTicket(ticket.identifier)}
										onDragStart={(e) => handleDragStart(e, ticket.identifier)}
									/>
								))}
							</div>

							{/* Quick Add Ticket Row Pinned at Bottom */}
							<div className="shrink-0 p-2 border-t border-border-default bg-surface-elevated/40">
								<AddTicketRow
									status={col.id}
									onAdd={(title, priority) =>
										onCreateTicket(title, priority, col.id)
									}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default BoardView;
