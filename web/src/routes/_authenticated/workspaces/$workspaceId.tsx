import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowPathIcon,
  Bars3Icon,
  CheckCircleIcon,
  HomeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  SparklesIcon,
  ArrowRightStartOnRectangleIcon
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api-client";
import { useSession } from "@/lib/auth-client";
import { ThemeToggleButton, ThemeToggleDropdownRow } from "@/components/ui/theme-toggle";
import { BoardView } from "@/components/workspaces/interactions/board-view";
import { SmoothInput } from "@/components/ui/skiper-ui/skiper106";
import { cn } from "@/lib/utils";
import type { components } from "@/types/api.gen";
import type { Ticket, Column } from "@/types/ticket";
import { motion } from "motion/react";

type Workspace = components["schemas"]["Workspace"];

export const Route = createFileRoute("/_authenticated/workspaces/$workspaceId")({
  component: WorkspaceKanban,
});

function Logo() {
  return (
    <div className="flex items-center gap-[3px] font-bold text-[17px] tracking-tight text-[var(--ink)] dark:text-[#f4f4f5]">
      <span className="grid place-items-center w-[18px] h-[20px] border border-[var(--blue)] text-[var(--blue)] font-serif text-[17px]">
        K
      </span>
      <span>izen</span>
      <i className="w-[5px] h-[5px] border border-[var(--blue)] ml-[1px]" />
    </div>
  );
}

const columns: Column[] = [
  { key: "backlog", title: "Backlog", tone: "#9a9a94" },
  { key: "todo", title: "To do", tone: "#6d75ce" },
  { key: "progress", title: "In progress", tone: "#d7975c" },
  { key: "review", title: "In review", tone: "#9b7ec6" },
  { key: "done", title: "Done", tone: "#6da488" },
];

export function WorkspaceKanban() {
  const { workspaceId } = Route.useParams();
  const navigate = useNavigate();
  const { data: session } = useSession();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("kizen_sidebar_open") === "true";
    }
    return false;
  });
  
  const handleSetSidebarOpen = (open: boolean) => {
    setIsSidebarOpen(open);
    if (typeof window !== "undefined") {
      localStorage.setItem("kizen_sidebar_open", open ? "true" : "false");
    }
  };

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
  
  const userName =
    (session?.user as { username?: string; name?: string })?.username ||
    session?.user?.name ||
    "User";
  const userInitials = userName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--paper)] dark:bg-[#0c0c0e] text-[var(--ink)] dark:text-[#f4f4f5] font-sans relative flex">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#272724] dark:bg-[#18181b] text-white dark:text-[#f4f4f5] px-4 py-3 shadow-lg border border-black/10 dark:border-white/10 text-[13px] animate-fade-in font-mono">
          <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {!isSidebarOpen && (
        <div className="fixed top-6 right-8 z-30 flex items-center gap-2 bg-[var(--paper)]/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md rounded-md pl-3 pr-1 py-1 border border-[var(--line)] dark:border-white/10 shadow-sm transition-all duration-300">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 focus:outline-none hover:text-black dark:hover:text-white transition-colors text-[13px] font-medium"
              >
                {currentWorkspaceName}{" "}
                <ChevronDownIcon className="w-3 h-3 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[220px] bg-white dark:bg-[#151517] text-black dark:text-white shadow-xl border border-[var(--line)] dark:border-white/10 rounded-md z-50 p-1"
            >
              {workspaces.map((w) => (
                <DropdownMenuItem
                  key={w.id}
                  onSelect={() => navigate({ to: `/workspaces/${w.id}` })}
                  className="flex items-center gap-2 cursor-pointer p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-sm outline-none text-[13px]"
                >
                  <span className="flex-1 truncate">{w.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-4 bg-[var(--line)] dark:bg-white/10 mx-1" />

          <button
            type="button"
            onClick={() => handleSetSidebarOpen(true)}
            className="p-1.5 text-[var(--ink)] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer rounded-sm"
            title="Open menu"
          >
            <Bars3Icon className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1 min-w-0 overflow-y-auto px-6 py-6 pb-24 bg-[var(--paper)] dark:bg-[#0c0c0e] text-[var(--ink)] dark:text-[#f4f4f5] flex flex-col">
        <div className="w-full flex-1 flex flex-col mx-auto h-full max-w-full">
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
      </main>

      <aside
        className={cn(
          "bg-[#fbfbf9] dark:bg-[#151517] h-screen sticky top-0 flex flex-col justify-between transition-[width,opacity] duration-300 z-20 flex-shrink-0",
          isSidebarOpen
            ? "w-72 border-l border-[var(--line)] dark:border-white/10 opacity-100"
            : "w-0 overflow-hidden border-l-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="flex flex-col p-4 gap-2 overflow-y-auto flex-1">
          <div className="flex items-center justify-between min-h-[36px] mb-3 px-1">
            <Link to="/home" className="text-inherit no-underline">
              <Logo />
            </Link>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigate({ to: "/home" })}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-[var(--muted)] dark:text-[#a1a1aa] hover:text-[var(--ink)] dark:hover:text-[#f4f4f5]"
                title="Go to Home"
              >
                <HomeIcon className="w-5 h-5" />
              </button>
              <ThemeToggleButton className="w-7 h-7 rounded-none border border-transparent hover:border-[var(--line)] dark:hover:border-white/10" />
              <button
                type="button"
                onClick={() => handleSetSidebarOpen(false)}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-[var(--muted)] dark:text-[#a1a1aa] hover:text-[var(--ink)] dark:hover:text-[#f4f4f5]"
                title="Collapse sidebar"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] dark:text-[#a1a1aa]">
                Agents
              </span>
              <span className="text-[9px] font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[var(--muted)] dark:text-[#a1a1aa]">
                Standby
              </span>
            </div>

            <div
              className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-[var(--muted)] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5 rounded-none transition-colors"
              title="Agent Worker (Placeholder)"
            >
              <SparklesIcon className="w-4 h-4 flex-shrink-0 text-[#6257d8]" />
              <div className="flex flex-col min-w-0">
                <span className="truncate font-medium text-[var(--ink)] dark:text-[#f4f4f5] leading-tight">
                  Agent Runner
                </span>
                <span className="text-[10px] text-[var(--soft)] dark:text-[#71717a] truncate leading-tight mt-0.5">
                  Awaiting deployment
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--line)] dark:border-white/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="group w-full flex items-center gap-2.5 p-2 transition-all cursor-pointer outline-none min-w-0 text-left rounded-none text-[var(--ink)] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 data-[state=open]:bg-black/5 dark:data-[state=open]:bg-white/5 focus-visible:ring-1 focus-visible:ring-[var(--blue)]"
              >
                <div className="grid place-items-center w-8 h-8 rounded-full bg-[#ced6ff] text-[#3448aa] font-mono text-[11px] font-medium flex-none">
                  {userInitials}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[13px] font-medium truncate leading-tight group-hover:text-[var(--blue)] transition-colors">
                    {userName}
                  </span>
                  <span className="text-[11px] text-[var(--soft)] dark:text-[#71717a] truncate leading-tight mt-0.5 font-mono">
                    Account settings
                  </span>
                </div>
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              alignOffset={0}
              className="w-56 mb-2 rounded-sm border border-[var(--line)] dark:border-white/10 bg-[var(--card)] dark:bg-[#151517] p-1 shadow-lg font-sans"
            >
              <ThemeToggleDropdownRow />
              <DropdownMenuItem
                className="flex items-center gap-2 px-2.5 py-2 text-[12px] text-[var(--ink)] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-none outline-none focus:bg-black/5 dark:focus:bg-white/5"
                onSelect={() => navigate({ to: "/" })}
              >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4 text-[var(--muted)] dark:text-[#a1a1aa]" />
                <span className="font-medium">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </div>
  );
}
