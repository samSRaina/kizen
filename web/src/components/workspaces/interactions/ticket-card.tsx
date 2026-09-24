import { Zap, MoreHorizontal } from "lucide-react";
import { Avatar } from "@/pages/AppBoard";
import type { Ticket } from "@/types/ticket"; // We will create this or use from AppBoard

export function TicketCard({
  ticket,
  isDragging,
  onDragStart,
  onDragEnd
}: {
  ticket: any;
  isDragging?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void
}) {
  const colors = { feature: "#5e63d7", bug: "#df7666", task: "#8e8e88" };

  return (
    <article
      className={`ticket-card ${isDragging ? 'opacity-50 ring-2 ring-blue-500 cursor-grabbing' : 'cursor-grab'}`}
      draggable="true"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="ticket-top">
        <span className="ticket-type" style={{ color: colors[ticket.type] }}>
          {ticket.type === "feature" ? "◇" : ticket.type === "bug" ? "⊘" : "□"}
        </span>
        <span className="ticket-id">{ticket.id}</span>
        <button aria-label="Ticket menu"><MoreHorizontal size={15} /></button>
      </div>
      <h4>{ticket.title}</h4>
      <div className="ticket-meta">
        <span className={`priority ${ticket.priority.toLowerCase()}`}>
          <Zap size={11} /> {ticket.priority}
        </span>
        {ticket.label && <span className="label">{ticket.label}</span>}
        <span className="points">{ticket.points}</span>
        <Avatar initials={ticket.assignee} />
      </div>
    </article>
  );
}
