import { useTickets } from '../../store/useTickets';
import { IssueRow } from './IssueRow';

export function IssueList() {
  const { filteredTickets, activeTab } = useTickets();

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'assigned':
        return 'Assigned to you';
      case 'in_progress':
        return 'In progress issues';
      case 'all':
      default:
        return 'All issues';
    }
  };

  return (
    <section className="list-panel" data-component="IssueList" aria-label="Issue list">
      <div className="list-panel-head">
        <h2>{getSectionTitle()}</h2>
        <span className="count">{filteredTickets.length} issues</span>
      </div>

      <div className="issue-rows-container">
        {filteredTickets.map((ticket) => (
          <IssueRow key={ticket.id} ticket={ticket} />
        ))}

        {filteredTickets.length === 0 && (
          <div className="empty-state">
            <p>No issues found matching the active filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}
