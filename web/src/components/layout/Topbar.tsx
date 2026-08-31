import { useTickets } from '../../store/useTickets';
import { PlusIcon } from '../common/Icons';

export function Topbar() {
  const { activeWorkspace, setIsCreateModalOpen } = useTickets();

  return (
    <header className="topbar" data-app-region="topbar">
      <div className="title-group">
        <h1>{activeWorkspace.activeSprint}</h1>
        <span className="sub">{activeWorkspace.sprintSubtitle}</span>
      </div>
      <div className="topbar-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
          aria-label="Create new issue"
        >
          <PlusIcon size={14} className="ic" />
          <span>New issue</span>
        </button>
      </div>
    </header>
  );
}
