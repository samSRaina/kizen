import { BoltIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import type { Ticket } from "@/types/ticket";

export function TicketCard({
	ticket,
	isDragging,
	onDragStart,
	onDragEnd,
	onDragOver,
	onDrop,
}: {
	ticket: Ticket;
	isDragging?: boolean;
	onDragStart: (e: React.DragEvent) => void;
	onDragEnd: (e: React.DragEvent) => void;
	onDragOver?: (e: React.DragEvent) => void;
	onDrop?: (e: React.DragEvent) => void;
}) {
	const colors = { feature: "#5e63d7", bug: "#df7666", task: "#8e8e88" };

	return (
		<article
			className={`ticket-card ${isDragging ? "opacity-50 ring-2 ring-blue-500 cursor-grabbing" : "cursor-grab"}`}
			draggable="true"
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			<div className="ticket-top">
				<span className="ticket-type" style={{ color: colors[ticket.type] }}>
					{ticket.type === "feature" ? "◇" : ticket.type === "bug" ? "⊗" : "□"}
				</span>
				<span className="ticket-id">{ticket.id}</span>
				<button type="button" aria-label="Ticket menu">
					<EllipsisHorizontalIcon className="w-4 h-4" />
				</button>
			</div>
			<h4>{ticket.title}</h4>
			<div className="ticket-meta">
				<span className={`priority ${ticket.priority.toLowerCase()}`}>
					<BoltIcon className="w-3 h-3 inline-block mr-0.5" /> {ticket.priority}
				</span>
				{ticket.label && <span className="label">{ticket.label}</span>}
				<span className="points">{ticket.points}</span>
				<span className="avatar">{ticket.assignee}</span>
			</div>
		</article>
	);
}
