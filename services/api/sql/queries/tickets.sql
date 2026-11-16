-- name: ListTicketsByWorkspace :many
SELECT t.*
FROM tickets t
JOIN workspaces w ON t.workspace_id = w.id
WHERE t.workspace_id = $1 AND w.owner_id = $2
ORDER BY t.created_at DESC;

-- name: ListTicketsByProject :many
SELECT t.*
FROM tickets t
JOIN projects p ON t.project_id = p.id
JOIN workspaces w ON t.workspace_id = w.id
WHERE t.workspace_id = $1 AND t.project_id = $2 AND w.owner_id = $3 AND p.deleted_at IS NULL
ORDER BY t.created_at DESC;

-- name: GetTicketByIdentifier :one
SELECT t.*
FROM tickets t
JOIN workspaces w ON t.workspace_id = w.id
WHERE t.workspace_id = $1 AND t.identifier = $2 AND w.owner_id = $3
LIMIT 1;

-- name: GetTicketByProjectAndIdentifier :one
SELECT t.*
FROM tickets t
JOIN projects p ON t.project_id = p.id
JOIN workspaces w ON t.workspace_id = w.id
WHERE t.workspace_id = $1 AND t.project_id = $2 AND t.identifier = $3 AND w.owner_id = $4 AND p.deleted_at IS NULL
LIMIT 1;

-- name: CreateTicket :one
WITH valid_project AS (
    SELECT p.id AS project_id, p.workspace_id, p.ticket_id_prefix
    FROM projects p
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE p.id = @project_id
      AND p.workspace_id = @workspace_id
      AND w.owner_id = @owner_id
      AND p.deleted_at IS NULL
),
next_ticket AS (
    SELECT COALESCE(MAX(t.ticket_num), 0) + 1 AS num
    FROM tickets t
    WHERE t.project_id = @project_id
)
INSERT INTO tickets (
    workspace_id,
    project_id,
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
    vp.workspace_id,
    vp.project_id,
    next_ticket.num,
    vp.ticket_id_prefix || '-' || next_ticket.num::text,
    @title,
    @description,
    @type,
    @status,
    @priority,
    @points,
    @tags
FROM valid_project vp
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
