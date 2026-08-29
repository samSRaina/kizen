export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'backlog' | 'in_progress' | 'in_review' | 'done';

export interface Ticket {
	ID: string;
	ProjectID: string;
	Identifier: string;
	Title: string;
	Description: string;
	Status: TicketStatus;
	Priority: TicketPriority;
	CreatedBy: string;
	Assignee?: string | null;
	DueDate?: string | null;
	CreatedAt: string;
	UpdatedAt: string;
}

export interface CreateTicketPayload {
	project_id: string;
	identifier: string;
	title: string;
	description: string;
	priority: TicketPriority;
	created_by: string;
}
