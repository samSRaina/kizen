-- WORKSPACES --
-- name: CreateWorkspace :one
INSERT INTO workspaces (owner_id, name, default_hourly_rate, description)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: ListWorkspaces :many
SELECT * FROM workspaces
WHERE owner_id = $1
ORDER BY created_at DESC;

-- name: GetWorkspaceByID :one
SELECT * FROM workspaces
WHERE id = $1 AND owner_id = $2;

-- name: DeleteWorkspace :execrows
DELETE FROM workspaces
WHERE id = $1 AND owner_id = $2;
