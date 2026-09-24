import { useMemo, useState } from "react";
import { Activity, Archive, Bell, CalendarDays, Check, ChevronDown, CircleHelp, Command, Filter, Grid2X2, Kanban, LayoutList, MoreHorizontal, Plus, Search, Settings, Sparkles, Star, Trash2, Users, X, Zap } from "lucide-react";

type Issue = { id: string; title: string; type: "feature" | "bug" | "task"; priority: "High" | "Medium" | "Low"; points: number; assignee: string; label?: string };
type Column = { key: string; title: string; tone: string };

const columns: Column[] = [
  { key: "backlog", title: "Backlog", tone: "#9a9a94" },
  { key: "todo", title: "To do", tone: "#6d75ce" },
  { key: "progress", title: "In progress", tone: "#d7975c" },
  { key: "review", title: "In review", tone: "#9b7ec6" },
  { key: "done", title: "Done", tone: "#6da488" },
];

const seedIssues: Record<string, Issue[]> = {
  backlog: [
    { id: "ZED-241", title: "Add keyboard shortcut map to command palette", type: "feature", priority: "Low", points: 3, assignee: "JD" },
    { id: "ZED-238", title: "Research shared project permissions", type: "task", priority: "Medium", points: 5, assignee: "MK", label: "research" },
  ],
  todo: [
    { id: "ZED-232", title: "Improve empty states for new workspaces", type: "feature", priority: "Medium", points: 3, assignee: "JD" },
    { id: "ZED-229", title: "Fix command palette focus on open", type: "bug", priority: "High", points: 2, assignee: "AL" },
    { id: "ZED-224", title: "Create release notes template", type: "task", priority: "Low", points: 1, assignee: "RM" },
  ],
  progress: [
    { id: "ZED-219", title: "Build native sprint timeline view", type: "feature", priority: "High", points: 8, assignee: "JD", label: "frontend" },
    { id: "ZED-216", title: "Sync issue activity to team feed", type: "feature", priority: "Medium", points: 5, assignee: "MK" },
  ],
  review: [
    { id: "ZED-210", title: "Add project members and roles", type: "feature", priority: "Medium", points: 5, assignee: "AL" },
    { id: "ZED-207", title: "Refine board density on smaller screens", type: "bug", priority: "Low", points: 3, assignee: "JD", label: "polish" },
  ],
  done: [
    { id: "ZED-201", title: "Set up Northwind Retail workspace", type: "task", priority: "Low", points: 2, assignee: "JD" },
    { id: "ZED-198", title: "Add drag and drop issue states", type: "feature", priority: "High", points: 5, assignee: "RM" },
    { id: "ZED-193", title: "Create sprint planning shell", type: "feature", priority: "Medium", points: 3, assignee: "MK" },
  ],
};

const workspaces = [
  ["Northwind Retail", "23", "#6257d8"], ["Halcyon Goods", "9", "#686bd9"], ["Fernhollow Labs", "14", "#7485ed"], ["Orso Studio", "5", "#8b9aff"],
];

function Logo() { return <div className="zed-mini-logo"><span>Z</span>zed<i /></div>; }
function Avatar({ initials, className = "" }: { initials: string; className?: string }) { return <span className={`avatar ${className}`}>{initials}</span>; }
function IssueCard({ issue, onMove }: { issue: Issue; onMove: (direction: number) => void }) {
  const colors = { feature: "#5e63d7", bug: "#df7666", task: "#8e8e88" };
  return <article className="issue-card">
    <div className="issue-top"><span className="issue-type" style={{ color: colors[issue.type] }}>{issue.type === "feature" ? "◇" : issue.type === "bug" ? "⊘" : "□"}</span><span className="issue-id">{issue.id}</span><button aria-label="Issue menu"><MoreHorizontal size={15} /></button></div>
    <h4>{issue.title}</h4>
    <div className="issue-meta"><span className={`priority ${issue.priority.toLowerCase()}`}><Zap size={11} /> {issue.priority}</span>{issue.label && <span className="label">{issue.label}</span>}<span className="points">{issue.points}</span><Avatar initials={issue.assignee} /></div>
    <div className="issue-hover"><button onClick={() => onMove(-1)} aria-label="Move left">←</button><button onClick={() => onMove(1)} aria-label="Move right">→</button></div>
  </article>;
}

function Sidebar({ activeWorkspace, setActiveWorkspace }: { activeWorkspace: string; setActiveWorkspace: (name: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  return <aside className={`floating-sidebar ${collapsed ? "collapsed" : ""}`}>
    <div className="profile-row"><Avatar initials="JD" className="profile-avatar" /><div className="profile-copy"><strong>Jordan Diaz</strong><span>Freelance dev</span></div><button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>{collapsed ? "<<" : ">>"}</button></div>
    <div className="side-nav"><button><Grid2X2 size={18} /><span>Dashboard</span></button><button><Star size={18} /><span>Starred</span></button></div>
    <div className="workspace-heading"><span>Workspaces</span><button><Plus size={15} /></button></div>
    <div className="workspace-list">{workspaces.map(([name, count, color]) => <button className={activeWorkspace === name ? "active" : ""} onClick={() => setActiveWorkspace(name)} key={name}><i style={{ background: color }} /><span>{name}</span><em>{count}</em></button>)}</div>
    <div className="side-bottom"><button><Trash2 size={18} /><span>Trash</span></button><button><Settings size={18} /><span>Settings</span></button></div>
  </aside>;
}

export default function Home() {
  const [activeWorkspace, setActiveWorkspace] = useState("Northwind Retail");
  const [activeView, setActiveView] = useState<"board" | "list">("board");
  const [activeFilter, setActiveFilter] = useState("All issues");
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [issues, setIssues] = useState(seedIssues);
  const [toast, setToast] = useState("");
  const sprintProgress = 17;

  const visibleIssues = useMemo(() => Object.fromEntries(Object.entries(issues).map(([key, list]) => [key, list.filter(i => !query || `${i.id} ${i.title}`.toLowerCase().includes(query.toLowerCase()))])), [issues, query]);
  const moveIssue = (column: string, index: number, direction: number) => { const colIndex = columns.findIndex(c => c.key === column); const destination = columns[colIndex + direction]; if (!destination) return; const issue = issues[column][index]; setIssues(prev => ({ ...prev, [column]: prev[column].filter((_, i) => i !== index), [destination.key]: [issue, ...prev[destination.key]] })); setToast(`${issue.id} moved to ${destination.title}`); setTimeout(() => setToast(""), 2000); };

  return <div className="app-shell">
    <header className="app-topbar"><div className="app-brand"><Logo /><span className="crumb">/</span><span className="crumb-current">App</span></div><div className="top-actions"><button className="quick-search"><Search size={15} /><span>Search issues</span><kbd>⌘ K</kbd></button><button aria-label="Notifications"><Bell size={17} /></button><button className="top-avatar"><Avatar initials="JD" /></button></div></header>
    <div className="app-content">
      <div className="content-main">
        <div className="page-kicker"><span className="workspace-dot" /> {activeWorkspace} <ChevronDown size={14} /></div>
        <div className="page-title-row"><div><h1>Sprint board</h1><p>Tuesday, September 24 <span>·</span> Sprint 14</p></div><div className="title-actions"><button className="icon-button"><CircleHelp size={16} /></button><button className="secondary-button"><Users size={15} /> Invite</button><button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={16} /> Create issue</button></div></div>
        <div className="sprint-summary"><div><span className="summary-label">SPRINT 14</span><strong>Northwind momentum</strong><span className="summary-date">Sep 16 — Sep 27</span></div><div className="progress-area"><div className="progress-copy"><span>{sprintProgress} of 29 issues complete</span><strong>59%</strong></div><div className="progress-track"><i style={{ width: "59%" }} /></div></div><div className="sprint-stat"><span>Days left</span><strong>3</strong></div></div>
        <div className="board-toolbar"><div className="view-toggle"><button className={activeView === "board" ? "active" : ""} onClick={() => setActiveView("board")}><Kanban size={15} /> Board</button><button className={activeView === "list" ? "active" : ""} onClick={() => setActiveView("list")}><LayoutList size={15} /> List</button></div><div className="toolbar-right"><div className="filter-select"><Filter size={14} /><select value={activeFilter} onChange={e => setActiveFilter(e.target.value)}><option>All issues</option><option>My issues</option><option>High priority</option></select></div><div className="search-issues"><Search size={14} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter by title..." /></div><button className="icon-button"><MoreHorizontal size={17} /></button></div></div>
        {activeView === "board" ? <div className="board">{columns.map(column => <section className="board-column" key={column.key}><div className="column-heading"><div><i style={{ background: column.tone }} /><h3>{column.title}</h3><span>{visibleIssues[column.key].length}</span></div><button><Plus size={15} /></button></div><div className="issue-stack">{visibleIssues[column.key].map((issue, index) => <IssueCard issue={issue} key={issue.id} onMove={(dir) => moveIssue(column.key, index, dir)} />)}<button className="add-card" onClick={() => setShowCreate(true)}><Plus size={14} /> Add issue</button></div></section>)}</div> : <div className="list-view">{columns.flatMap(c => visibleIssues[c.key].map(issue => ({ ...issue, status: c.title }))).map(issue => <div className="list-row" key={issue.id}><span className="list-status">{issue.status}</span><span className="list-type">{issue.type}</span><strong>{issue.id}</strong><span>{issue.title}</span><span className="list-priority">{issue.priority}</span><Avatar initials={issue.assignee} /></div>)}</div>}
      </div>
    </div>
    <Sidebar activeWorkspace={activeWorkspace} setActiveWorkspace={setActiveWorkspace} />
    <div className="status-bar"><span><Activity size={13} /> All systems operational</span><span>Last synced just now</span></div>
    {toast && <div className="toast"><Check size={15} /> {toast}</div>}
    {showCreate && <div className="modal-backdrop" onClick={() => setShowCreate(false)}><div className="create-modal" onClick={e => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">NEW ISSUE</span><h2>Create an issue</h2></div><button onClick={() => setShowCreate(false)}><X size={18} /></button></div><label>Issue title<input autoFocus placeholder="What needs to be done?" /></label><div className="form-grid"><label>Type<select><option>Feature</option><option>Bug</option><option>Task</option></select></label><label>Priority<select><option>Medium</option><option>High</option><option>Low</option></select></label></div><label>Description<textarea placeholder="Add a little context..." /></label><div className="modal-actions"><button className="secondary-button" onClick={() => setShowCreate(false)}>Cancel</button><button className="primary-button" onClick={() => { setShowCreate(false); setToast("Issue created in Backlog"); setTimeout(() => setToast(""), 2000); }}>Create issue</button></div></div></div>}
  </div>;
}
