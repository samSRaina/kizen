CREATE TYPE ticket_status as ENUM (
    'backlog',
    'in_progress',
    'in_review',
    'done'
);

CREATE TYPE ticket_priority as ENUM (
    'critical',
    'high',
    'medium',
    'low'
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    number BIGINT NOT NULL,
    identifier TEXT NOT NULL,

    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',

    status ticket_status NOT NULL DEFAULT 'backlog',
    priority ticket_priority NOT NULL DEFAULT 'medium',
    tags TEXT[] DEFAULT '{}',

    position DOUBLE PRECISION NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_ticket_workspace_identifier UNIQUE (identifier)
    CONSTRAINT unique_ticket_workspace_num UNIQUE (workspace_id, number)
);

CREATE INDEX idx_tickets_workspace_status_pos ON tickets(workspace_id, status, position);
