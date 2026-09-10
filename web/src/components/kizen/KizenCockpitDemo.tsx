import React, { useState } from "react";
import { 
  Building2, 
  Clock, 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  ArrowUpRight, 
  Play, 
  Pause, 
  Tag, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Terminal,
  FolderLock
} from "lucide-react";
import { 
  Workspace, 
  Ticket, 
  INITIAL_WORKSPACES, 
  INITIAL_TICKETS 
} from "../../lib/kizen-store";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";

export function KizenCockpitDemo() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(INITIAL_WORKSPACES[0].id);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [activeFilter, setActiveFilter] = useState<"all" | "in_progress" | "review" | "done">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Timer state
  const [activeTimerTicketId, setActiveTimerTicketId] = useState<string | null>("tk-101");
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const workspaceTickets = tickets.filter((t) => t.workspaceId === activeWorkspace.id);
  
  const filteredTickets = activeFilter === "all" 
    ? workspaceTickets 
    : workspaceTickets.filter((t) => t.status === activeFilter);

  const totalHoursLogged = workspaceTickets.reduce((sum, t) => sum + t.hoursLogged, 0);
  const totalBillable = totalHoursLogged * activeWorkspace.default_hourly_rate;

  const handleAddWorkspace = (newWs: Workspace) => {
    setWorkspaces((prev) => [newWs, ...prev]);
    setActiveWorkspaceId(newWs.id);
  };

  const handleStatusChange = (ticketId: string, newStatus: Ticket["status"]) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus, updatedAt: "Just now" } : t))
    );
  };

  const handleLogQuickTime = (ticketId: string, hours: number) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, hoursLogged: Number((t.hoursLogged + hours).toFixed(2)), updatedAt: "Just now" }
          : t
      )
    );
  };

  const getStatusBadge = (status: Ticket["status"]) => {
    switch (status) {
      case "in_progress":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">IN PROGRESS</span>;
      case "review":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30">IN REVIEW</span>;
      case "done":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">DONE / BILLED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-gray-500/15 text-gray-300 border border-gray-500/30">BACKLOG</span>;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-xl border border-white/10 bg-[#0c0f16] shadow-2xl overflow-hidden font-sans text-left transition-colors duration-200">
      {/* Cockpit Window Header */}
      <div className="h-11 px-4 bg-[#121620] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="h-3.5 w-px bg-white/10 mx-1" />
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <FolderLock size={13} className="text-[var(--brand-accent)]" />
            <span className="text-gray-200 font-semibold">{activeWorkspace.name}</span>
            <span className="text-gray-500">({activeWorkspace.id})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 border border-white/5 text-[11px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SQLite Engine: 1.4ms</span>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[var(--brand-accent)] text-black hover:brightness-110 cursor-pointer"
          >
            <Plus size={13} />
            <span>New Workspace</span>
          </button>
        </div>
      </div>

      {/* Main Cockpit Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Left Sidebar: Client Workspaces */}
        <div className="lg:col-span-4 bg-[#0a0d14] border-r border-white/10 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                Client Workspaces ({workspaces.length})
              </span>
              <span className="text-[10px] font-mono text-[var(--brand-accent-text)]">
                Isolated DB
              </span>
            </div>

            <div className="space-y-1.5">
              {workspaces.map((ws) => {
                const isSelected = ws.id === activeWorkspace.id;
                const wsTix = tickets.filter((t) => t.workspaceId === ws.id);
                const wsHours = wsTix.reduce((acc, t) => acc + t.hoursLogged, 0);

                return (
                  <button
                    key={ws.id}
                    onClick={() => setActiveWorkspaceId(ws.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-[var(--surface-2)] border-[var(--brand-accent-border)] shadow-sm"
                        : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5 text-gray-400"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-medium text-sm text-white truncate pr-2">
                        {ws.name}
                      </div>
                      <span className="font-mono text-xs font-semibold text-[var(--brand-accent-text)] shrink-0">
                        ${ws.default_hourly_rate}/hr
                      </span>
                    </div>
                    {ws.description && (
                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-1 font-sans">
                        {ws.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] font-mono text-gray-400">
                      <span>{wsTix.length} tickets</span>
                      <span className="text-gray-300 font-medium">
                        {wsHours.toFixed(1)}h logged (${(wsHours * ws.default_hourly_rate).toLocaleString()})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics Card */}
          <div className="mt-4 p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-2.5">
            <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between">
              <span>ACTIVE WORKSPACE TOTALS</span>
              <span className="text-amber-400">${activeWorkspace.default_hourly_rate}/hr rate</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
              <div>
                <div className="text-[10px] text-gray-400 font-mono">HOURS LOGGED</div>
                <div className="text-base font-bold font-mono text-white tabular-nums">
                  {totalHoursLogged.toFixed(2)}h
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-mono">BILLABLE TOTAL</div>
                <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                  ${totalBillable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Panel: Ticket Stream & Live Triage */}
        <div className="lg:col-span-8 bg-[#0e121a] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/40 border border-white/5 text-xs font-mono">
                {(["all", "in_progress", "review", "done"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      activeFilter === filter
                        ? "bg-white/10 text-white font-semibold shadow-inner"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {filter === "all" ? "All Tickets" : filter.replace("_", " ").toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Active Timer Pill */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)} 
                  className="hover:scale-110 cursor-pointer"
                  title="Toggle Timer"
                >
                  {isTimerRunning ? <Pause size={12} className="text-amber-400" /> : <Play size={12} className="text-amber-400" />}
                </button>
                <span>Live Timer: <strong>01:42:18</strong></span>
              </div>
            </div>

            {/* Ticket Cards List */}
            <div className="mt-4 space-y-3">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-lg text-gray-500 text-xs font-mono">
                  No tickets found in this state.
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const billableForTicket = ticket.hoursLogged * activeWorkspace.default_hourly_rate;

                  return (
                    <div
                      key={ticket.id}
                      className="p-3.5 rounded-lg border border-white/10 bg-[#131722] hover:border-[var(--brand-accent-border)] transition-all shadow-sm group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[var(--brand-accent-text)]">
                            {ticket.key}
                          </span>
                          {getStatusBadge(ticket.status)}
                          <span className="text-[11px] font-mono text-gray-500">
                            {ticket.updatedAt}
                          </span>
                        </div>

                        {/* Status Switcher dropdown simulation */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value as Ticket["status"])}
                            className="bg-black/60 border border-white/10 text-gray-300 text-[11px] font-mono rounded px-2 py-0.5 focus:outline-none focus:border-[var(--brand-accent)] cursor-pointer"
                          >
                            <option value="backlog">Backlog</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">In Review</option>
                            <option value="done">Done / Billed</option>
                          </select>
                        </div>
                      </div>

                      <h4 className="text-sm font-semibold text-white mt-1.5 line-clamp-1">
                        {ticket.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1 font-sans">
                        {ticket.description}
                      </p>

                      {/* Ticket Footer: Time logged + Quick add + Tags */}
                      <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {ticket.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-gray-400 border border-white/5"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="font-mono text-[11px] text-gray-300 tabular-nums">
                            <strong>{ticket.hoursLogged}h</strong> / {ticket.estimatedHours}h
                            <span className="text-emerald-400 ml-1 font-semibold">
                              (${billableForTicket.toFixed(0)})
                            </span>
                          </div>
                          <button
                            onClick={() => handleLogQuickTime(ticket.id, 0.5)}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white cursor-pointer"
                            title="Log 30 minutes"
                          >
                            +30m
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick CLI helper bar */}
          <div className="mt-4 p-2.5 rounded-lg bg-black/50 border border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
            <div className="flex items-center gap-2">
              <Terminal size={13} className="text-[var(--brand-accent)]" />
              <span>CLI: <code className="text-gray-200">kizen log {workspaceTickets[0]?.key || "ACM-104"} 0.5h</code></span>
            </div>
            <span className="text-[11px] text-gray-500 hidden sm:inline">Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px]">c</kbd> to quick-create</span>
          </div>
        </div>
      </div>

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleAddWorkspace}
      />
    </div>
  );
}
