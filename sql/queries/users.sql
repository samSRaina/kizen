-- USERS --
-- name: GetUserByID :one
SELECT * FROM "user"
WHERE id = $1;

-- name: GetUserByEmail :one
SELECT * FROM "user"
WHERE email = $1;

-- name: GetUserByUsername :one
SELECT * FROM "user"
WHERE username = $1;

-- name: ListUsers :many
SELECT * FROM "user"
ORDER BY "createdAt" DESC;

-- name: UpdateUserProfile :one
UPDATE "user"
SET name = $2, image = $3, "updatedAt" = NOW()
WHERE id = $1
RETURNING *;

-- name: UpdateUserUsername :one
UPDATE "user"
SET username = $2, "displayUsername" = $2, "updatedAt" = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM "user"
WHERE id = $1;
