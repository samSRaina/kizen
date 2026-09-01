CREATE TABLE organizatons(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
	slug        TEXT NOT NULL,
	description TEXT NOT NULL,

	created_by  UUID NOT NULL REFERENCES users(id),

	created_at TIMESTAMPTZ DEFAULT NOW(),
	UpdatedAt TIMESTAMPTZ DEFAULT NOW()
)


-- TODO: ORGANIZATION MEMEBER MODEL
--
--
-- CREATE TYPE role as ENUM (
--     'client',
--     'developer'
-- );


-- CREATE TABLE organization_member (
--     organization_id UUID NOT NULL REFERENCES organization(id),
--     user_id UUID NOT NULL REFERENCES users(id),

--     role role,
--     joined_at TIMESTAMPZ NOT NULL DEFAULT NOW()
-- )
