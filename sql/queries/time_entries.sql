-- TIME-ENTRIES --
-- name: CreateTimeEntry :one
INSERT INTO time_entries (ticket_id, duration_minutes, is_billable, status)
VALUES ($1, $2, $3, 'PENDING')
RETURNING *;

-- name: ListPendingTimeEntriesByWorkspace :many
SELECT te.* FROM time_entries te
JOIN tickets t ON te.ticket_id = t.id
JOIN projects p ON t.project_id = p.id
WHERE p.workspace_id = $1 AND te.status = 'PENDING';

-- name: ClearPendingTimeEntries :exec
UPDATE time_entries
SET status = 'CLEARED', settlement_id = $2, updated_at = NOW()
WHERE id = ANY($1::UUID[]);
