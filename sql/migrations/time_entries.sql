CREATE TYPE time_entry_status AS ENUM (
    'pending',
    'cleared'
);

CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    settlement_id UUID REFERENCES settlements(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL,
    is_billable BOOLEAN NOT NULL DEFAULT TRUE,
    status time_entry_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
