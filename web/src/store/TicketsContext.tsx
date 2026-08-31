import { createContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Ticket, TabFilter, ViewMode, TicketPriority, TicketStatus } from '../types/ticket';
import type { Workspace, UserProfile } from '../types/workspace';
import { ticketsApi } from '../api/tickets.api';
import { APIError } from '../types/api';

const DEFAULT_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000002',
  name: 'Jordan Diaz',
  role: 'Freelance dev',
  initials: 'JD',
};

const WORKSPACES: Workspace[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Northwind Retail',
    dotColor: 'var(--gesso-data-1)',
    issueCount: 23,
    activeSprint: 'Sprint 24 — Northwind Retainer',
    sprintSubtitle: '4 client workspaces · 3 active sprints',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Halcyon Goods',
    dotColor: 'var(--gesso-data-2)',
    issueCount: 9,
    activeSprint: 'Sprint 12 — Halcyon E-Commerce',
    sprintSubtitle: 'Storefront revamp & checkout flow',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Fernhollow Labs',
    dotColor: 'var(--gesso-data-3)',
    issueCount: 14,
    activeSprint: 'Sprint 8 — Analytics Pipeline',
    sprintSubtitle: 'ETL ingestion & reporting dashboard',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Orso Studio',
    dotColor: 'var(--gesso-data-4)',
    issueCount: 5,
    activeSprint: 'Sprint 3 — Brand Identity',
    sprintSubtitle: 'Asset export & component kit',
  },
];

const SEED_TICKETS: Ticket[] = [
  {
    id: 'nw-142',
    projectId: '00000000-0000-0000-0000-000000000001',
    identifier: 'NW-142',
    title: 'Fix invoice PDF export losing line-item tax breakdown',
    description: 'When generating monthly invoices with tiered taxes, subtotal calculation truncates decimal points.',
    status: 'in_progress',
    priority: 'high',
    createdBy: '00000000-0000-0000-0000-000000000002',
    assignee: '00000000-0000-0000-0000-000000000002',
    assigneeInitials: 'JD',
    dueDate: 'Fri',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nw-138',
    projectId: '00000000-0000-0000-0000-000000000001',
    identifier: 'NW-138',
    title: 'Migrate client portal auth to OAuth2 refresh tokens',
    description: 'Implement silent rotation of tokens to keep client sessions active without relogin.',
    status: 'todo',
    priority: 'medium',
    createdBy: '00000000-0000-0000-0000-000000000002',
    assignee: '00000000-0000-0000-0000-000000000002',
    assigneeInitials: 'JD',
    dueDate: 'Mon',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nw-135',
    projectId: '00000000-0000-0000-0000-000000000001',
    identifier: 'NW-135',
    title: 'Retainer dashboard: weekly hours chart renders blank on Safari',
    description: 'Canvas resize observer timing bug in WebKit causes blank rendering on initial load.',
    status: 'in_review',
    priority: 'high',
    createdBy: '00000000-0000-0000-0000-000000000002',
    assignee: '00000000-0000-0000-0000-000000000002',
    assigneeInitials: 'JD',
    dueDate: 'Today',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nw-129',
    projectId: '00000000-0000-0000-0000-000000000001',
    identifier: 'NW-129',
    title: 'Add webhook for this app invoice.paid to update project status',
    description: 'Hook up webhook receiver to automatically clear accounts receivable flag.',
    status: 'todo',
    priority: 'medium',
    createdBy: '00000000-0000-0000-0000-000000000002',
    assignee: '00000000-0000-0000-0000-000000000002',
    assigneeInitials: 'JD',
    dueDate: 'Wed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nw-121',
    projectId: '00000000-0000-0000-0000-000000000001',
    identifier: 'NW-121',
    title: 'Write onboarding doc for new client handoff checklist',
    description: 'Standardize client handover steps and credentials transfer guidelines.',
    status: 'in_progress',
    priority: 'low',
    createdBy: '00000000-0000-0000-0000-000000000002',
    assignee: '00000000-0000-0000-0000-000000000002',
    assigneeInitials: 'JD',
    dueDate: 'Thu',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nw-117',
    projectId: '00000000-0000-0000-0000-000000000001',
    identifier: 'NW-117',
    title: 'Rebuild timesheet CSV export to include billable flag',
    description: 'Client accounting team requested column for billable vs non-billable hours.',
    status: 'todo',
    priority: 'medium',
    createdBy: '00000000-0000-0000-0000-000000000002',
    assignee: '00000000-0000-0000-0000-000000000002',
    assigneeInitials: 'JD',
    dueDate: 'Fri',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nw-110',
    projectId: '00000000-0000-0000-0000-000000000001',
    identifier: 'NW-110',
    title: 'Polish empty states across settings pages',
    description: 'Ensure subtle illustrations and clear copy for zero-state views.',
    status: 'backlog',
    priority: 'low',
    createdBy: '00000000-0000-0000-0000-000000000002',
    assignee: '00000000-0000-0000-0000-000000000002',
    assigneeInitials: 'JD',
    dueDate: '—',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nw-104',
    projectId: '00000000-0000-0000-0000-000000000001',
    identifier: 'NW-104',
    title: 'Investigate slow query on projects list for large workspaces',
    description: 'Index optimization on tickets(project_id, identifier) table.',
    status: 'in_review',
    priority: 'high',
    createdBy: '00000000-0000-0000-0000-000000000002',
    assignee: '00000000-0000-0000-0000-000000000002',
    assigneeInitials: 'JD',
    dueDate: 'Mon',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export interface CreateIssueInput {
  title: string;
  identifier?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  projectId?: string;
  createdBy?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface TicketsContextValue {
  tickets: Ticket[];
  filteredTickets: Ticket[];
  currentUser: UserProfile;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  activeTab: TabFilter;
  viewMode: ViewMode;
  searchQuery: string;
  isCreateModalOpen: boolean;
  loading: boolean;
  toasts: ToastNotification[];
  nextIdentifier: string;
  metrics: {
    openCount: number;
    inReviewCount: number;
    dueThisWeekCount: number;
  };
  setWorkspace: (id: string) => void;
  setActiveTab: (tab: TabFilter) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  createIssue: (input: CreateIssueInput) => Promise<Ticket | null>;
  quickCreateIssue: (title: string) => Promise<Ticket | null>;
  dismissToast: (id: string) => void;
}

export const TicketsContext = createContext<TicketsContextValue | null>(null);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(WORKSPACES[0].id);
  const [activeTab, setActiveTab] = useState<TabFilter>('assigned');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [issueCounter, setIssueCounter] = useState<number>(143);

  const activeWorkspace = useMemo(() => {
    return WORKSPACES.find((w) => w.id === activeWorkspaceId) || WORKSPACES[0];
  }, [activeWorkspaceId]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const nextIdentifier = useMemo(() => {
    return `NW-${issueCounter}`;
  }, [issueCounter]);

  const createIssue = useCallback(
    async (input: CreateIssueInput): Promise<Ticket | null> => {
      setLoading(true);
      const identifier = input.identifier || `NW-${issueCounter}`;
      const projectId = input.projectId || activeWorkspace.id;
      const createdBy = input.createdBy || DEFAULT_USER.id;
      const priority = input.priority || 'medium';
      const title = input.title.trim();
      const description = input.description?.trim() || '';

      try {
        const createdTicket = await ticketsApi.createTicket({
          project_id: projectId,
          identifier,
          title,
          description,
          priority,
          created_by: createdBy,
        });

        // Update server state store
        setTickets((prev) => [createdTicket, ...prev]);
        setIssueCounter((prev) => prev + 1);
        addToast('success', `Created issue ${createdTicket.identifier}`);
        return createdTicket;
      } catch (err: unknown) {
        const message = err instanceof APIError ? err.message : 'Failed to create ticket';
        addToast('error', message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [issueCounter, activeWorkspace.id, addToast]
  );

  const quickCreateIssue = useCallback(
    async (title: string): Promise<Ticket | null> => {
      if (!title.trim()) return null;
      return createIssue({
        title,
        priority: 'high',
        status: 'todo',
      });
    },
    [createIssue]
  );

  const setWorkspace = useCallback((id: string) => {
    setActiveWorkspaceId(id);
  }, []);

  // Filtered tickets derived purely from store state
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Tab filter
      if (activeTab === 'assigned') {
        if (ticket.assignee !== DEFAULT_USER.id && ticket.assigneeInitials !== DEFAULT_USER.initials) {
          return false;
        }
      } else if (activeTab === 'in_progress') {
        if (ticket.status !== 'in_progress') {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ticket.title.toLowerCase().includes(q);
        const matchesId = ticket.identifier.toLowerCase().includes(q);
        const matchesDesc = ticket.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, activeTab, searchQuery]);

  // Sprint metrics derived from state
  const metrics = useMemo(() => {
    const openCount = tickets.filter((t) => t.status !== 'done').length;
    const inReviewCount = tickets.filter((t) => t.status === 'in_review').length;
    const dueThisWeekCount = tickets.filter((t) => t.dueDate && t.dueDate !== '—').length;
    return { openCount, inReviewCount, dueThisWeekCount };
  }, [tickets]);

  const value: TicketsContextValue = {
    tickets,
    filteredTickets,
    currentUser: DEFAULT_USER,
    workspaces: WORKSPACES,
    activeWorkspace,
    activeTab,
    viewMode,
    searchQuery,
    isCreateModalOpen,
    loading,
    toasts,
    nextIdentifier,
    metrics,
    setWorkspace,
    setActiveTab,
    setViewMode,
    setSearchQuery,
    setIsCreateModalOpen,
    createIssue,
    quickCreateIssue,
    dismissToast,
  };

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
}
