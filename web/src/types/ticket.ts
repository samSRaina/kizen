export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';

export type TicketStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';

export interface Ticket {
  id: string;
  projectId: string;
  identifier: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdBy: string;
  assignee?: string | null;
  assigneeInitials?: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  project_id: string;
  identifier: string;
  title: string;
  description: string;
  priority: TicketPriority;
  created_by: string;
}

export interface RawTicketResponse {
  ID?: string;
  id?: string;
  ProjectID?: string;
  project_id?: string;
  Identifier?: string;
  identifier?: string;
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  Status?: string;
  status?: string;
  Priority?: string;
  priority?: string;
  CreatedBy?: string;
  created_by?: string;
  Assignee?: string | null;
  assignee?: string | null;
  DueDate?: string | null;
  due_date?: string | null;
  CreatedAt?: string;
  created_at?: string;
  UpdatedAt?: string;
  updated_at?: string;
}

export type TabFilter = 'all' | 'assigned' | 'in_progress';
export type ViewMode = 'list' | 'board';
