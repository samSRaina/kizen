import type { Ticket } from '../../types/ticket';
import { PriorityHighIcon, PriorityMedIcon, PriorityLowIcon } from '../common/Icons';

interface IssueRowProps {
  ticket: Ticket;
}

export function IssueRow({ ticket }: IssueRowProps) {
  const renderPriorityIcon = () => {
    switch (ticket.priority) {
      case 'critical':
      case 'high':
        return (
          <span className="issue-priority high" title={`Priority: ${ticket.priority}`}>
            <PriorityHighIcon size={14} />
          </span>
        );
      case 'medium':
        return (
          <span className="issue-priority med" title={`Priority: ${ticket.priority}`}>
            <PriorityMedIcon size={14} />
          </span>
        );
      case 'low':
      default:
        return (
          <span className="issue-priority" title={`Priority: ${ticket.priority}`}>
            <PriorityLowIcon size={14} />
          </span>
        );
    }
  };

  const getStatusClass = () => {
    switch (ticket.status) {
      case 'in_progress':
        return 'issue-status progress';
      case 'in_review':
        return 'issue-status review';
      case 'done':
        return 'issue-status done';
      case 'todo':
        return 'issue-status todo';
      case 'backlog':
      default:
        return 'issue-status';
    }
  };

  const formatStatusLabel = () => {
    switch (ticket.status) {
      case 'in_progress':
        return 'In progress';
      case 'in_review':
        return 'In review';
      case 'todo':
        return 'Todo';
      case 'done':
        return 'Done';
      case 'backlog':
      default:
        return 'Backlog';
    }
  };

  return (
    <div className="issue-row" role="listitem" tabIndex={0}>
      <span className="issue-key">{ticket.identifier}</span>
      {renderPriorityIcon()}
      <span className="issue-title" title={ticket.title}>
        {ticket.title}
      </span>
      <span className={getStatusClass()}>{formatStatusLabel()}</span>
      <span className="issue-due">{ticket.dueDate || '—'}</span>
      <span className="issue-assignee">{ticket.assigneeInitials || 'JD'}</span>
    </div>
  );
}
