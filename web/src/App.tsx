import { TicketsProvider } from './store/TicketsContext';
import { useTickets } from './store/useTickets';
import { Shell } from './components/layout/Shell';
import { StatusRow } from './components/metrics/StatusRow';
import { Toolbar } from './components/toolbar/Toolbar';
import { Composer } from './components/composer/Composer';
import { IssueList } from './components/board/IssueList';
import { KanbanBoard } from './components/board/KanbanBoard';

function DashboardContent() {
  const { viewMode } = useTickets();

  return (
    <div className="work-region">
      {/* Header Band: Status metrics & Toolbar */}
      <section className="header-band" data-brief-id="header-band">
        <StatusRow />
        <Toolbar />
      </section>

      {/* Main Work Surface */}
      <main className="work-surface" data-app-region="work-surface">
        <Composer />
        {viewMode === 'list' ? <IssueList /> : <KanbanBoard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TicketsProvider>
      <Shell>
        <DashboardContent />
      </Shell>
    </TicketsProvider>
  );
}
