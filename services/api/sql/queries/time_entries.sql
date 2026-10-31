-- name: ListTimeEntries :many
SELECT te.*
FROM time_entries te
JOIN workspaces w ON te.workspace_id = w.id
WHERE te.workspace_id = @workspace_id
  AND w.owner_id = @owner_id
  AND (sqlc.narg('ticket_id')::uuid IS NULL OR te.ticket_id = sqlc.narg('ticket_id'))
ORDER BY te.started_at DESC;

-- name: GetTimeEntryByID :one
SELECT te.*
FROM time_entries te
JOIN workspaces w ON te.workspace_id = w.id
WHERE te.id = @id
  AND te.workspace_id = @workspace_id
  AND w.owner_id = @owner_id
LIMIT 1;

-- name: GetActiveTimeEntry :one
SELECT te.*
FROM time_entries te
JOIN workspaces w ON te.workspace_id = w.id
WHERE te.workspace_id = @workspace_id
  AND w.owner_id = @owner_id
  AND te.ended_at IS NULL
ORDER BY te.started_at DESC
LIMIT 1;

-- name: StopActiveTimeEntries :exec
UPDATE time_entries te
SET
    ended_at = NOW(),
    duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (NOW() - te.started_at))::integer),
    updated_at = NOW()
FROM workspaces w
WHERE te.workspace_id = w.id
  AND te.workspace_id = @workspace_id
  AND w.owner_id = @owner_id
  AND te.ended_at IS NULL;

-- name: CreateTimeEntry :one
WITH valid_workspace AS (
    SELECT w.id, w.default_hourly_rate
    FROM workspaces w
    WHERE w.id = @workspace_id AND w.owner_id = @owner_id
)
INSERT INTO time_entries (
    workspace_id,
    ticket_id,
    description,
    started_at,
    ended_at,
    duration_seconds,
    billable,
    hourly_rate
)
SELECT
    vw.id,
    @ticket_id,
    @description,
    @started_at,
    @ended_at,
    @duration_seconds,
    @billable,
    COALESCE(sqlc.narg('hourly_rate')::integer, vw.default_hourly_rate)
FROM valid_workspace vw
RETURNING *;

-- name: StopTimeEntry :one
UPDATE time_entries te
SET
    ended_at = NOW(),
    duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (NOW() - te.started_at))::integer),
    updated_at = NOW()
FROM workspaces w
WHERE te.workspace_id = w.id
  AND te.id = @id
  AND te.workspace_id = @workspace_id
  AND w.owner_id = @owner_id
  AND te.ended_at IS NULL
RETURNING te.*;

-- name: UpdateTimeEntry :one
UPDATE time_entries te
SET
    ticket_id        = COALESCE(sqlc.narg('ticket_id'), te.ticket_id),
    description      = COALESCE(sqlc.narg('description'), te.description),
    started_at       = COALESCE(sqlc.narg('started_at'), te.started_at),
    ended_at         = COALESCE(sqlc.narg('ended_at'), te.ended_at),
    duration_seconds = COALESCE(sqlc.narg('duration_seconds'), te.duration_seconds),
    billable         = COALESCE(sqlc.narg('billable'), te.billable),
    hourly_rate      = COALESCE(sqlc.narg('hourly_rate'), te.hourly_rate),
    updated_at       = NOW()
FROM workspaces w
WHERE te.workspace_id = w.id
  AND te.id = @id
  AND te.workspace_id = @workspace_id
  AND w.owner_id = @owner_id
RETURNING te.*;

-- name: DeleteTimeEntry :execrows
DELETE FROM time_entries te
USING workspaces w
WHERE te.workspace_id = w.id
  AND te.id = @id
  AND te.workspace_id = @workspace_id
  AND w.owner_id = @owner_id;
