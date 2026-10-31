-- name: ListTicketsByWorkspace :many
SELECT t.*
FROM tickets t
JOIN workspaces w ON t.workspace_id = w.id
WHERE t.workspace_id = $1 AND w.owner_id = $2
ORDER BY t.created_at DESC;

-- name: GetTicketByIdentifier :one
SELECT t.*
FROM tickets t
JOIN workspaces w ON t.workspace_id = w.id
WHERE t.workspace_id = $1 AND t.identifier = $2 AND w.owner_id = $3
LIMIT 1;

-- name: CreateTicket :one
WITH valid_workspace AS (
    SELECT w.id, w.name
    FROM workspaces w
    WHERE w.id = @workspace_id AND w.owner_id = @owner_id
),
next_ticket AS (
    SELECT COALESCE(MAX(t.ticket_num), 0) + 1 AS num
    FROM tickets t
    WHERE t.workspace_id = @workspace_id
)
INSERT INTO tickets (
    workspace_id,
    ticket_num,
    identifier,
    title,
    description,
    type,
    status,
    priority,
    points,
    tags
)
SELECT
    vw.id,
    next_ticket.num,
    COALESCE(
        NULLIF(UPPER(SUBSTRING(REGEXP_REPLACE(vw.name, '[^a-zA-Z0-9]', '', 'g') FROM 1 FOR 3)), ''),
        'KZ'
    ) || '-' || next_ticket.num::text,
    @title,
    @description,
    @type,
    @status,
    @priority,
    @points,
    @tags
FROM valid_workspace vw
CROSS JOIN next_ticket
RETURNING *;

-- name: UpdateTicket :one
UPDATE tickets t
SET
    title       = COALESCE(sqlc.narg('title'), t.title),
    description = COALESCE(sqlc.narg('description'), t.description),
    type        = COALESCE(sqlc.narg('type'), t.type),
    status      = COALESCE(sqlc.narg('status'), t.status),
    priority    = COALESCE(sqlc.narg('priority'), t.priority),
    points      = COALESCE(sqlc.narg('points'), t.points),
    tags        = COALESCE(sqlc.narg('tags'), t.tags),
    updated_at  = NOW()
FROM workspaces w
WHERE t.workspace_id = w.id
  AND t.workspace_id = @workspace_id
  AND t.identifier = @identifier
  AND w.owner_id = @owner_id
RETURNING t.*;

-- name: DeleteTicket :execrows
DELETE FROM tickets t
USING workspaces w
WHERE t.workspace_id = w.id
  AND t.workspace_id = $1
  AND t.identifier = $2
  AND w.owner_id = $3;
