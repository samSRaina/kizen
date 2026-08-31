import { useTickets } from '../../store/useTickets';
import type { Ticket, TicketStatus } from '../../types/ticket';
import { PriorityHighIcon, PriorityMedIcon, PriorityLowIcon } from '../common/Icons';

interface ColumnDef {
  id: TicketStatus;
  label: string;
  dotColor: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'backlog', label: 'Backlog', dotColor: 'var(--gesso-fg-muted)' },
  { id: 'in_progress', label: 'In Progress', dotColor: 'var(--gesso-accent)' },
  { id: 'in_review', label: 'In Review', dotColor: 'var(--gesso-warning)' },
  { id: 'done', label: 'Done', dotColor: 'var(--gesso-success)' },
];

export function KanbanBoard() {
  const { filteredTickets } = useTickets();

  const getTicketsForColumn = (status: TicketStatus): Ticket[] => {
    return filteredTickets.filter((t) => {
      if (status === 'backlog') {
        return t.status === 'backlog' || t.status === 'todo';
      }
      return t.status === status;
    });
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return (
          <span className="kanban-card-priority high">
            <PriorityHighIcon size={12} />
            <span>High</span>
          </span>
        );
      case 'medium':
        return (
          <span className="kanban-card-priority med">
            <PriorityMedIcon size={12} />
            <span>Med</span>
          </span>
        );
      case 'low':
      default:
        return (
          <span className="kanban-card-priority low">
            <PriorityLowIcon size={12} />
            <span>Low</span>
          </span>
        );
    }
  };

  return (
    <div className="kanban-board" role="region" aria-label="Kanban board">
      {COLUMNS.map((col) => {
        const columnTickets = getTicketsForColumn(col.id);

        return (
          <div key={col.id} className="kanban-column">
            <div className="kanban-column-header">
              <div className="kanban-column-title">
                <span className="kanban-dot" style={{ background: col.dotColor }} />
                <h3>{col.label}</h3>
              </div>
              <span className="kanban-count">{columnTickets.length}</span>
            </div>

            <div className="kanban-cards-wrap">
              {columnTickets.map((ticket) => (
                <div key={ticket.id} className="kanban-card" tabIndex={0}>
                  <div className="kanban-card-top">
                    <span className="kanban-card-key">{ticket.identifier}</span>
                    {renderPriorityBadge(ticket.priority)}
                  </div>
                  <h4 className="kanban-card-title">{ticket.title}</h4>
                  {ticket.description && (
                    <p className="kanban-card-desc">{ticket.description}</p>
                  )}
                  <div className="kanban-card-footer">
                    <span className="kanban-card-due">{ticket.dueDate || 'Sprint 24'}</span>
                    <span className="issue-assignee">{ticket.assigneeInitials || 'JD'}</span>
                  </div>
                </div>
              ))}

              {columnTickets.length === 0 && (
                <div className="kanban-empty">No issues</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
