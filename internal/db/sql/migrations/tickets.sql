CREATE TYPE status as ENUM (
    'backlog',
    'in_progress',
    'in_review',
    'done'
);

CREATE TYPE priority as ENUM (
    'critical',
    'high',
    'medium',
    'low'
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    project_id UUID NOT NULL,

    identifier TEXT NOT NULL,
	title       TEXT NOT NULL,
	description TEXT NOT NULL,

	status status NOT NULL DEFAULT 'backlog',
	priority priority NOT NULL,

	created_by UUID NOT NULL,
	assignee  UUID,

	due_date TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tickets ADD CONSTRAINT uq_ticket_project_identifier UNIQUE (project_id, identifier);


CREATE INDEX idx_tickets_project_id ON tickets(project_id);
CREATE INDEX idx_tickets_assignee ON tickets(assignee);
