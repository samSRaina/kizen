-- name: CreateTicket :one
INSERT INTO tickets (
    project_id, identifier, title, description, status, priority, tags
) VALUES (
$1, $2, $3, $4, $5, $6, $7
)
RETURNING *;

-- name: GetTicket :one
SELECT * FROM tickets
WHERE project_id = $1
AND identifier = $2;

-- name: ListTicketsByProject :many
SELECT * FROM tickets
WHERE project_id = $1
ORDER BY created_at DESC;
