-- name: CreateProject :one
INSERT INTO projects (
    workspace_id,
    name,
    ticket_id_prefix,
    settings,
    default_hourly_rate,
    description
)
SELECT
    w.id,
    @name,
    @ticket_id_prefix,
    @settings,
    @default_hourly_rate,
    @description
FROM workspaces w
WHERE w.id = @workspace_id AND w.owner_id = @owner_id
RETURNING *;

-- name: ListProjectsByWorkspace :many
SELECT p.*
FROM projects p
JOIN workspaces w ON p.workspace_id = w.id
WHERE p.workspace_id = $1 AND w.owner_id = $2 AND p.deleted_at IS NULL
ORDER BY p.created_at ASC;

-- name: GetProjectByID :one
SELECT p.*
FROM projects p
JOIN workspaces w ON p.workspace_id = w.id
WHERE p.id = $1 AND p.workspace_id = $2 AND w.owner_id = $3 AND p.deleted_at IS NULL
LIMIT 1;

-- name: UpdateProject :one
UPDATE projects p
SET
    name                = COALESCE(sqlc.narg('name'), p.name),
    ticket_id_prefix    = COALESCE(sqlc.narg('ticket_id_prefix'), p.ticket_id_prefix),
    settings            = COALESCE(sqlc.narg('settings'), p.settings),
    default_hourly_rate = COALESCE(sqlc.narg('default_hourly_rate'), p.default_hourly_rate),
    description         = COALESCE(sqlc.narg('description'), p.description),
    updated_at          = NOW()
FROM workspaces w
WHERE p.workspace_id = w.id
  AND p.id = @id
  AND p.workspace_id = @workspace_id
  AND w.owner_id = @owner_id
  AND p.deleted_at IS NULL
RETURNING p.*;

-- name: DeleteProject :execrows
UPDATE projects p
SET deleted_at = NOW()
FROM workspaces w
WHERE p.workspace_id = w.id
  AND p.id = @id
  AND p.workspace_id = @workspace_id
  AND w.owner_id = @owner_id
  AND p.deleted_at IS NULL;

-- name: GetFirstProjectByWorkspace :one
SELECT p.*
FROM projects p
JOIN workspaces w ON p.workspace_id = w.id
WHERE p.workspace_id = $1 AND w.owner_id = $2 AND p.deleted_at IS NULL
ORDER BY p.created_at ASC
LIMIT 1;
