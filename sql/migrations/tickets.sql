CREATE TYPE ticket_status as ENUM (
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
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    identifier TEXT NOT NULL,
	title       TEXT NOT NULL,
	description TEXT NOT NULL,
	status ticket_status NOT NULL DEFAULT 'backlog',
	priority priority NOT NULL,
	tags TEXT[] NOT NULL DEFAULT '{}', -- Lean array for tags
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT uq_ticket_project_identifier UNIQUE (project_id, identifier)
);
