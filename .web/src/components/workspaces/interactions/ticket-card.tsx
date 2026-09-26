import { BoltIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
export function Avatar({
	initials,
	className = "",
}: {
	initials: string;
	className?: string;
}) {
	return <span className={`avatar ${className}`}>{initials}</span>;
}
import type { Ticket } from "@/types"; // We will create this or use from AppBoard

export function TicketCard({
	ticket,
	isDragging,
	onDragStart,
	onDragEnd,
}: {
	ticket: any;
	isDragging?: boolean;
	onDragStart: (e: React.DragEvent) => void;
	onDragEnd: (e: React.DragEvent) => void;
}) {
	const colors = { feature: "#5e63d7", bug: "#df7666", task: "#8e8e88" };

	return (
		<article
			className={`ticket-card ${isDragging ? "opacity-50 ring-2 ring-blue-500 cursor-grabbing" : "cursor-grab"}`}
			draggable="true"
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
		>
			<div className="ticket-top">
				<span className="ticket-type" style={{ color: colors[ticket.type] }}>
					{ticket.type === "feature" ? "◇" : ticket.type === "bug" ? "⊘" : "□"}
				</span>
				<span className="ticket-id">{ticket.id}</span>
				<button aria-label="Ticket menu">
					<EllipsisHorizontalIcon width={15} height={15} />
				</button>
			</div>
			<h4>{ticket.title}</h4>
			<div className="ticket-meta">
				<span className={`priority ${ticket.priority.toLowerCase()}`}>
					<BoltIcon width={11} height={11} /> {ticket.priority}
				</span>
				{ticket.label && <span className="label">{ticket.label}</span>}
				<span className="points">{ticket.points}</span>
				<Avatar initials={ticket.assignee} />
			</div>
		</article>
	);
}
