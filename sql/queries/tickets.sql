-- name: CreateTicket :one
INSERT INTO tickets (
    workspace_id, identifier, title, description, type, status, priority, points, assignee_id, tags
) VALUES (
$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
)
RETURNING *;

-- name: GetTicket :one
SELECT * FROM tickets
WHERE workspace_id = $1
AND identifier = $2;

-- name: ListTicketsByWorkspace :many
SELECT * FROM tickets
WHERE workspace_id = $1
ORDER BY created_at DESC;

-- name: UpdateTicket :one
UPDATE tickets
SET 
  title = COALESCE(NULLIF(sqlc.arg(title)::text, ''), title),
  description = COALESCE(NULLIF(sqlc.arg(description)::text, ''), description),
  type = COALESCE(NULLIF(sqlc.arg(type)::text, '')::ticket_type, type),
  status = COALESCE(NULLIF(sqlc.arg(status)::text, '')::ticket_status, status),
  priority = COALESCE(NULLIF(sqlc.arg(priority)::text, '')::ticket_priority, priority),
  points = COALESCE(NULLIF(sqlc.arg(points)::integer, 0), points),
  assignee_id = COALESCE(NULLIF(sqlc.arg(assignee_id)::text, ''), assignee_id),
  updated_at = NOW()
WHERE workspace_id = sqlc.arg(workspace_id) AND identifier = sqlc.arg(identifier)
RETURNING *;

-- name: DeleteTicket :execrows
DELETE FROM tickets
WHERE workspace_id = $1 AND identifier = $2;
