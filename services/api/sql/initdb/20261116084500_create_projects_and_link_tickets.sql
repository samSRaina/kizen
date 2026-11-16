-- +goose Up
CREATE TABLE IF NOT EXISTS projects (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    ticket_id_prefix    VARCHAR(10) NOT NULL,
    settings            JSONB NOT NULL DEFAULT '{}',
    default_hourly_rate INTEGER NOT NULL DEFAULT 0,
    description         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_workspace_name ON projects (workspace_id, name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_workspace_created ON projects (workspace_id, created_at DESC) WHERE deleted_at IS NULL;

-- Populate default project for each existing workspace if none exists
INSERT INTO projects (workspace_id, name, ticket_id_prefix, default_hourly_rate, description)
SELECT 
    w.id,
    w.name,
    COALESCE(NULLIF(UPPER(SUBSTRING(REGEXP_REPLACE(w.name, '[^a-zA-Z0-9]', '', 'g') FROM 1 FOR 4)), ''), 'PRJ'),
    w.default_hourly_rate,
    w.description
FROM workspaces w
ON CONFLICT DO NOTHING;

-- Add project_id to tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Backfill project_id for existing tickets
UPDATE tickets t
SET project_id = p.id
FROM projects p
WHERE p.workspace_id = t.workspace_id AND t.project_id IS NULL;

-- Make project_id NOT NULL
ALTER TABLE tickets ALTER COLUMN project_id SET NOT NULL;

-- Drop old workspace-scoped unique constraints if they exist
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_workspace_identifier_key;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_workspace_ticket_num_key;

-- Add project-scoped unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_project_identifier ON tickets (project_id, identifier);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_project_ticket_num ON tickets (project_id, ticket_num);
CREATE INDEX IF NOT EXISTS idx_tickets_project_created ON tickets (project_id, created_at DESC);
