-- name: CreateTicket :one
INSERT INTO tickets (
    project_id, identifier, title, description, status, priority, created_by
) VALUES (
$1, $2, $3, $4, $5, $6, $7
)
RETURNING *;

-- name: GetTicket :one
SELECT * FROM tickets
WHERE id = $1;
