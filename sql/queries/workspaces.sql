-- WORKSPACES --
-- name: CreateWorkspace :one
INSERT INTO workspaces (name, default_hourly_rate)
VALUES ($1, $2)
RETURNING *;

-- name: ListWorkspaces :many
SELECT * FROM workspaces
ORDER BY created_at DESC;

-- name: GetWorkspaceByID :one
SELECT * FROM workspaces
WHERE id = $1;
