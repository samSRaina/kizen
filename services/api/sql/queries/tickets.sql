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
WITH next_ticket AS (
    SELECT COALESCE(MAX(ticket_num), 0) + 1 AS num
    FROM tickets
    WHERE workspace_id = @workspace_id
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
    @workspace_id,
    next_ticket.num,
    @prefix::text || '-' || next_ticket.num::text,
    @title,
    @description,
    @type,
    @status,
    @priority,
    @points,
    @tags
FROM next_ticket
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
