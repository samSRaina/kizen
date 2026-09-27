CREATE TABLE workspaces(
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id            VARCHAR NOT NULL,
    name                TEXT NOT NULL,
    default_hourly_rate INTEGER NOT NULL,
    description         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT workspaces_owner_id_name_key UNIQUE (owner_id, name)
);
