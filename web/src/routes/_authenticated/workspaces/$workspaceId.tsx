import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { AppLayout } from "@/components/app-shell/layout";
import { SmoothInput } from "@/components/ui/smooth-input";
import { apiClient } from "@/lib/api-client";
import { BoardView } from "@/components/workspaces/interactions/board-view";
import type { components } from "@/types/api.gen";
import type { Ticket, Column } from "@/types/ticket";

type Workspace = components["schemas"]["Workspace"];

export const Route = createFileRoute("/_authenticated/workspaces/$workspaceId")({
  component: WorkspaceKanban,
});

const columns: Column[] = [
  { key: "backlog", title: "Backlog", tone: "#9a9a94" },
  { key: "todo", title: "To do", tone: "#6d75ce" },
  { key: "progress", title: "In progress", tone: "#d7975c" },
  { key: "review", title: "In review", tone: "#9b7ec6" },
  { key: "done", title: "Done", tone: "#6da488" },
];

export function WorkspaceKanban() {
  const { workspaceId } = Route.useParams();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };
  
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  
  const [tickets, setTickets] = useState<Record<string, Ticket[]>>({
    backlog: [],
    todo: [],
    progress: [],
    review: [],
    done: [],
  });

  const visibleTickets = useMemo(() => {
    return Object.fromEntries(
      Object.entries(tickets).map(([key, list]) => [
        key,
        list.filter(
          (i) =>
            !query ||
            `${i.id} ${i.title}`.toLowerCase().includes(query.toLowerCase())
        ),
      ])
    );
  }, [tickets, query]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const { data } = await apiClient.GET("/api/v1/workspaces");
        if (data) {
          setWorkspaces(data);
          const current = data.find((w) => w.id === workspaceId);
          if (current) {
            setActiveWorkspace(current);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [workspaceId]);

  const onMoveTicket = (
    sourceCol: string,
    sourceIndex: number,
    targetCol: string,
    targetIndex?: number
  ) => {
    setTickets((prev) => {
      const next = { ...prev };
      const ticketToMove = next[sourceCol][sourceIndex];
      next[sourceCol] = next[sourceCol].filter((_, i) => i !== sourceIndex);

      if (targetIndex !== undefined) {
        next[targetCol] = [
          ...next[targetCol].slice(0, targetIndex),
          ticketToMove,
          ...next[targetCol].slice(targetIndex),
        ];
      } else {
        next[targetCol] = [...next[targetCol], ticketToMove];
      }
      return next;
    });
    showToast("Ticket moved");
  };

  const currentWorkspaceName = activeWorkspace?.name || "Loading Workspace...";

  return (
    <AppLayout
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        showWorkspaceSwitcher={true}
    >
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#272724] dark:bg-[#18181b] text-white dark:text-[#f4f4f5] px-4 py-3 shadow-lg border border-black/10 dark:border-white/10 text-[13px] animate-fade-in font-mono">
          <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="w-full flex-1 flex flex-col mx-auto h-full max-w-full px-6 py-6 pb-24 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 mb-6 border-b border-[var(--line)] dark:border-white/10 gap-4 mt-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] tracking-tight font-medium my-0 text-[var(--ink)] dark:text-[#f4f4f5]">
              {currentWorkspaceName}
            </h1>
            <p className="text-[13px] text-[var(--muted)] font-mono">
              {activeWorkspace?.description || "Sprint board"}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <SmoothInput 
               placeholder="Search tickets..." 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               wrapperClassName="max-w-[250px] p-2 bg-black/5 dark:bg-white/5 rounded-md h-[40px] border-none"
               className="text-[13px] placeholder:text-[var(--muted)] dark:placeholder:text-[#a1a1aa]"
             />
             <button 
                type="button"
                className="flex items-center gap-2 bg-[var(--ink)] text-[var(--paper)] dark:bg-white dark:text-black px-4 py-2 rounded-sm text-[13px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap h-[40px]"
                onClick={() => setShowCreate(true)}
             >
               <PlusIcon className="w-4 h-4" /> Create ticket
             </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)] dark:text-[#a1a1aa] flex-1">
            <ArrowPathIcon className="w-6 h-6 animate-spin mb-3" />
            <span className="text-[13px] font-mono">
              Loading workspace...
            </span>
          </div>
        ) : (
           <div className="flex-1 min-h-[500px]">
             <BoardView 
               columns={columns} 
               visibleTickets={visibleTickets} 
               onMoveTicket={onMoveTicket} 
               onCreateTicket={() => setShowCreate(true)} 
             />
           </div>
        )}
      </div>
    </AppLayout>
  );
}
