-- name: CreateTicket :one
INSERT INTO tickets (
    project_id, identifier, title, description, status, priority, created_by, assignee, due_date
) VALUES (
$1, $2, $3, $4, $5, $6 , $7, $8, $9
)
RETURNING *;

-- name: GetTicket :one
SELECT * FROM tickets
WHERE id = $1;
