-- +goose Up
CREATE TABLE IF NOT EXISTS time_entries (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    ticket_id        UUID REFERENCES tickets(id) ON DELETE SET NULL,
    description      TEXT,
    started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at         TIMESTAMPTZ,
    duration_seconds INTEGER,
    billable         BOOLEAN NOT NULL DEFAULT TRUE,
    hourly_rate      INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_entries_workspace_started ON time_entries (workspace_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_time_entries_ticket ON time_entries (ticket_id) WHERE ticket_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_time_entries_active ON time_entries (workspace_id) WHERE ended_at IS NULL;

-- +goose Down
DROP TABLE IF EXISTS time_entries;
