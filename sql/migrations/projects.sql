CREATE TABLE projects (
	id              UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
	name        TEXT NOT NULL,
	description TEXT NOT NULL,
	hourly_rate_override INTEGER, -- is intentionally nullable
	archived bool NOT NULL,
	ticket_counter INTEGER NOT NULL DEFAULT 0,
	created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
