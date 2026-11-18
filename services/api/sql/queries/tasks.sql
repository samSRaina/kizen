-- name: ListTasksByProject :many
SELECT t.*
FROM tasks t
WHERE t.project_id = $1
ORDER BY t.position ASC, t.created_at ASC;

-- name: GetTaskByID :one
SELECT t.*
FROM tasks t
WHERE t.id = $1
LIMIT 1;

-- name: GetTaskByIdentifier :one
SELECT t.*
FROM tasks t
WHERE t.identifier = $1
LIMIT 1;

-- name: CreateTask :one
WITH project_info AS (
    SELECT p.ticket_id_prefix AS prefix
    FROM projects p
    WHERE p.id = @project_id
),
next_task AS (
    SELECT COALESCE(MAX(t.task_num), 0) + 1 AS num,
           COALESCE(MAX(t.position), 0.0::double precision) + 1000.0::double precision AS next_pos
    FROM tasks t
    WHERE t.project_id = @project_id
)
INSERT INTO tasks (
    project_id,
    task_num,
    identifier,
    title,
    description,
    type,
    status,
    priority,
    position
)
SELECT
    @project_id::uuid AS project_id,
    next_task.num,
    project_info.prefix || '-' || next_task.num::text AS identifier,
    @title::text AS title,
    sqlc.narg('description')::text AS description,
    @type::varchar(32) AS type,
    @status::varchar(32) AS status,
    @priority::varchar(32) AS priority,
    COALESCE(sqlc.narg('position')::double precision, next_task.next_pos) AS position
FROM project_info
CROSS JOIN next_task
RETURNING *;

-- name: UpdateTask :one
UPDATE tasks t
SET
    title       = COALESCE(sqlc.narg('title'), t.title),
    description = COALESCE(sqlc.narg('description'), t.description),
    type        = COALESCE(sqlc.narg('type'), t.type),
    status      = COALESCE(sqlc.narg('status'), t.status),
    priority    = COALESCE(sqlc.narg('priority'), t.priority),
    updated_at  = NOW()
WHERE t.id = @id
RETURNING t.*;

-- name: ReorderTask :one
UPDATE tasks t
SET
    position   = @position,
    updated_at = NOW()
WHERE t.id = @id
RETURNING t.*;

-- name: DeleteTask :execrows
DELETE FROM tasks t
WHERE t.id = $1;
