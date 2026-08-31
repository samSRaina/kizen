import { apiClient } from './client';
import type { CreateTicketRequest, RawTicketResponse, Ticket, TicketPriority, TicketStatus } from '../types/ticket';

function normalizeTicket(raw: RawTicketResponse): Ticket {
  const id = raw.ID || raw.id || crypto.randomUUID();
  const projectId = raw.ProjectID || raw.project_id || '';
  const identifier = raw.Identifier || raw.identifier || 'ISSUE-0';
  const title = raw.Title || raw.title || 'Untitled Issue';
  const description = raw.Description || raw.description || '';
  const status = (raw.Status || raw.status || 'backlog').toLowerCase() as TicketStatus;
  const priority = (raw.Priority || raw.priority || 'medium').toLowerCase() as TicketPriority;
  const createdBy = raw.CreatedBy || raw.created_by || '';
  const assignee = raw.Assignee || raw.assignee || null;
  const dueDate = raw.DueDate || raw.due_date || null;
  const createdAt = raw.CreatedAt || raw.created_at || new Date().toISOString();
  const updatedAt = raw.UpdatedAt || raw.updated_at || new Date().toISOString();

  return {
    id,
    projectId,
    identifier,
    title,
    description,
    status,
    priority,
    createdBy,
    assignee,
    assigneeInitials: assignee ? assignee.slice(0, 2).toUpperCase() : 'JD',
    dueDate,
    createdAt,
    updatedAt,
  };
}

export const ticketsApi = {
  async createTicket(payload: CreateTicketRequest): Promise<Ticket> {
    const raw = await apiClient.post<RawTicketResponse>('/api/tickets', payload);
    return normalizeTicket(raw);
  },

  async getTickets(): Promise<Ticket[]> {
    try {
      const rawList = await apiClient.get<RawTicketResponse[]>('/api/tickets');
      if (Array.isArray(rawList)) {
        return rawList.map(normalizeTicket);
      }
      return [];
    } catch {
      // Backend currently only implements POST /api/tickets
      return [];
    }
  },
};
