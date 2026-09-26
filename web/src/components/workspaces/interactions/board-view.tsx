import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import type { Column, Ticket } from "@/types/ticket";
import { TicketCard } from "./ticket-card";

interface BoardViewProps {
	columns: Column[];
	visibleTickets: Record<string, Ticket[]>;
	onMoveTicket: (
		sourceCol: string,
		sourceIndex: number,
		targetCol: string,
		targetIndex?: number,
	) => void;
	onCreateTicket: () => void;
}

export function BoardView({
	columns,
	visibleTickets,
	onMoveTicket,
	onCreateTicket,
}: BoardViewProps) {
	const [draggingId, setDraggingId] = useState<string | null>(null);

	const handleDragStart = (
		e: React.DragEvent,
		issueId: string,
		sourceCol: string,
		sourceIndex: number,
	) => {
		setDraggingId(issueId);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData(
			"text/plain",
			JSON.stringify({ issueId, sourceCol, sourceIndex }),
		);
	};

	const handleDragEnd = () => {
		setDraggingId(null);
	};

	const handleDrop = (
		e: React.DragEvent,
		targetCol: string,
		targetIndex?: number,
	) => {
		e.preventDefault();
		if (!draggingId) return;

		try {
			const data = JSON.parse(e.dataTransfer.getData("text/plain"));
			const { sourceCol, sourceIndex } = data;

			if (sourceCol === targetCol && sourceIndex === targetIndex) return;

			onMoveTicket(sourceCol, sourceIndex, targetCol, targetIndex);
		} catch {}
	};

	const handleDragOverColumn = (e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	return (
		<div className="board">
			{columns.map((col) => {
				const issues = visibleTickets[col.key] || [];

				return (
					<section
						className="board-column"
						key={col.key}
						onDragOver={handleDragOverColumn}
						onDrop={(e) => handleDrop(e, col.key)}
						aria-label={col.title}
					>
						<div className="column-heading">
							<div>
								<i style={{ background: col.tone }} />
								<h3>{col.title}</h3>
								<span>{issues.length}</span>
							</div>
							<button
								type="button"
								onClick={onCreateTicket}
								aria-label={`Add ticket to ${col.title}`}
							>
								<PlusIcon className="w-3.5 h-3.5" />
							</button>
						</div>
						<div className="ticket-stack">
							{issues.map((ticket, index) => (
								<TicketCard
									key={ticket.id}
									ticket={ticket}
									isDragging={draggingId === ticket.id}
									onDragStart={(e) =>
										handleDragStart(e, ticket.id, col.key, index)
									}
									onDragEnd={handleDragEnd}
									onDragOver={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									onDrop={(e) => {
										e.preventDefault();
										e.stopPropagation();
										handleDrop(e, col.key, index);
									}}
								/>
							))}
							<button
								type="button"
								className="add-card"
								onClick={onCreateTicket}
							>
								<PlusIcon className="w-3.5 h-3.5" /> Add ticket
							</button>
						</div>
					</section>
				);
			})}
		</div>
	);
}
