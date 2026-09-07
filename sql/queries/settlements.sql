-- SETTLEMENTS --
-- name: CreateSettlement :one
INSERT INTO settlements (workspace_id, total_amount)
VALUES ($1, $2)
RETURNING *;
