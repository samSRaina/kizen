import { useState } from "react";
import { Plus } from "lucide-react";
import { TicketCard } from "./ticket-card";
import type { Ticket, Column } from "@/types/ticket";

interface BoardViewProps {
  columns: Column[];
  visibleTickets: Record<string, Ticket[]>;
  onMoveTicket: (sourceCol: string, sourceIndex: number, targetCol: string, targetIndex?: number) => void;
  onCreateTicket: () => void;
}

export function BoardView({ columns, visibleTickets, onMoveTicket, onCreateTicket }: BoardViewProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumnKey, setOverColumnKey] = useState<string | null>(null);
  const [overCardId, setOverCardId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, issueId: string, sourceCol: string, sourceIndex: number) => {
    setDraggingId(issueId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ issueId, sourceCol, sourceIndex }));
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverColumnKey(null);
    setOverCardId(null);
  };

  const handleDrop = (e: React.DragEvent, targetCol: string, targetIndex?: number) => {
    e.preventDefault();
    setOverColumnKey(null);
    setOverCardId(null);
    
    if (!draggingId) return;
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { sourceCol, sourceIndex } = data;
      
      if (sourceCol === targetCol && sourceIndex === targetIndex) return;

      onMoveTicket(sourceCol, sourceIndex, targetCol, targetIndex);
    } catch {}
  };

  const handleDragOverColumn = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverColumnKey(colKey);
  };

  const handleDragOverCard = (e: React.DragEvent, colKey: string, cardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setOverColumnKey(colKey);
    setOverCardId(cardId);
  };

  const handleDragLeaveColumn = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setOverColumnKey(null);
    }
  };

  return (
    <div className="board">
      {columns.map(column => (
        <section 
          className={`board-column rounded-xl transition-all duration-200 ${overColumnKey === column.key ? 'bg-[#f4f5fa] dark:bg-muted ring-[1.5px] ring-[#6257d8]/30 px-1.5 pb-10' : ''}`} 
          key={column.key}
          onDragOver={(e) => handleDragOverColumn(e, column.key)}
          onDragLeave={handleDragLeaveColumn}
          onDrop={(e) => handleDrop(e, column.key)}
        >
          <div className="column-heading">
            <div>
              <i style={{ background: column.tone }} />
              <h3>{column.title}</h3>
              <span>{visibleTickets[column.key]?.length || 0}</span>
            </div>
            <button aria-label="Add ticket to column" onClick={onCreateTicket}>
              <Plus size={15} />
            </button>
          </div>
          <div className="ticket-stack min-h-[50px]">
            {visibleTickets[column.key]?.map((ticket, index) => (
              <div 
                key={ticket.id}
                className={`relative ${overCardId === ticket.id && draggingId !== ticket.id ? 'border-t-2 border-[#6257d8]/60 mt-2' : ''}`}
                onDragOver={(e) => handleDragOverCard(e, column.key, ticket.id)}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleDrop(e, column.key, index);
                }}
              >
                <TicketCard 
                  ticket={ticket} 
                  isDragging={draggingId === ticket.id}
                  onDragStart={(e) => handleDragStart(e, ticket.id, column.key, index)}
                  onDragEnd={handleDragEnd}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
