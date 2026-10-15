-- name: ListWorkspaces :many
SELECT
    id,
    owner_id,
    name,
    default_hourly_rate,
    description,
    created_at,
    updated_at
FROM workspaces
WHERE owner_id = $1
ORDER BY created_at DESC;

-- name: GetWorkspaceByID :one
SELECT
    id,
    owner_id,
    name,
    default_hourly_rate,
    description,
    created_at,
    updated_at
FROM workspaces
WHERE id = $1 AND owner_id = $2
LIMIT 1;

-- name: CreateWorkspace :one
INSERT INTO workspaces (
    owner_id,
    name,
    default_hourly_rate,
    description
) VALUES (
    $1, $2, $3, $4
)
RETURNING
    id,
    owner_id,
    name,
    default_hourly_rate,
    description,
    created_at,
    updated_at;

-- name: DeleteWorkspace :execrows
DELETE FROM workspaces
WHERE id = $1 AND owner_id = $2;
