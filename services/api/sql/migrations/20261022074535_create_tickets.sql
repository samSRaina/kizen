-- +goose Up
CREATE TABLE IF NOT EXISTS tickets (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    ticket_num   BIGINT NOT NULL,                  -- Sequential number per workspace (1, 2, 3...)
    identifier   VARCHAR(64) NOT NULL,             -- Human friendly slug: e.g. "KZ-1", "KZ-2"
    title        TEXT NOT NULL,
    description  TEXT,
    type         VARCHAR(32) NOT NULL DEFAULT 'task',     -- 'feature' | 'bug' | 'task'
    status       VARCHAR(32) NOT NULL DEFAULT 'backlog',  -- 'backlog' | 'todo' | 'progress' | 'review' | 'done'
    priority     VARCHAR(32) NOT NULL DEFAULT 'Medium',   -- 'High' | 'Medium' | 'Low'
    points       INTEGER NOT NULL DEFAULT 0,
    tags         TEXT[] NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tickets_workspace_identifier_key UNIQUE (workspace_id, identifier),
    CONSTRAINT tickets_workspace_ticket_num_key UNIQUE (workspace_id, ticket_num)
);

CREATE INDEX IF NOT EXISTS idx_tickets_workspace_created ON tickets (workspace_id, created_at DESC);

-- +goose Down
DROP TABLE IF EXISTS tickets;
