-- +goose Up
ALTER TABLE time_entries
    ADD COLUMN IF NOT EXISTS is_manual BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS timer_state VARCHAR(32) NOT NULL DEFAULT 'stopped';

-- Set existing records to appropriate timer_state
UPDATE time_entries
SET timer_state = CASE
    WHEN ended_at IS NULL THEN 'running'
    ELSE 'stopped'
END;

CREATE INDEX IF NOT EXISTS idx_time_entries_running_state
    ON time_entries (workspace_id, timer_state)
    WHERE timer_state IN ('running', 'paused');

-- +goose Down
DROP INDEX IF EXISTS idx_time_entries_running_state;
ALTER TABLE time_entries
    DROP COLUMN IF EXISTS timer_state,
    DROP COLUMN IF EXISTS is_manual;
