-- PROJECTS --
-- name: CreateProject :one
INSERT INTO projects (workspace_id, name, hourly_rate_override)
VALUES ($1, $2, $3)
RETURNING *;

-- name: UpdateProjectCounter :one
UPDATE projects
SET ticket_counter = ticket_counter + 1, updated_at = NOW()
WHERE id = $1
RETURNING ticket_counter;

-- name: ListProjectsByWorkspace :many
SELECT * FROM projects
WHERE workspace_id = $1
ORDER BY created_at DESC;
