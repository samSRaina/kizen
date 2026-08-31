import { useTickets } from '../../store/useTickets';

export function StatusRow() {
  const { metrics } = useTickets();

  return (
    <div className="status-row" data-app-region="status" aria-label="Sprint metrics">
      <div className="status-cell">
        <span className="status-num">{metrics.openCount}</span>
        <span className="status-label">Open issues</span>
        <span className="status-delta up">+3 this week</span>
      </div>

      <div className="status-cell">
        <span className="status-num">{metrics.inReviewCount}</span>
        <span className="status-label">In review</span>
        <span className="status-delta">unchanged</span>
      </div>

      <div className="status-cell">
        <span className="status-num">{metrics.dueThisWeekCount}</span>
        <span className="status-label">Due this week</span>
        <span className="status-delta">2 overdue</span>
      </div>
    </div>
  );
}
