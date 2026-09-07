CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    total_amount INTEGER NOT NULL,
    cleared_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
