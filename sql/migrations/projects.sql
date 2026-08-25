CREATE TABLE projects (
	id              UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	organization_id UUID NOT NULL REFERENCES organization(id),

	name        TEXT NOT NULL,
	description TEXT NOT NULL,

	created_by UUID NOT NULL REFERENCES users(id),
	archived bool NOT NULL,

	created_at TIMESTAMPZ  NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPZ NOT NULL DEFAULT NOW()
)


-- TODO: PROJECT MEMBER MODEL
--
--
-- CREATE TABLE project_member_model (
--     project_id UUID NOT NULL REFERENCES projects(id),
-- 	user_id    UUID NOT NULL REFERENCES users(id),

-- 	added_by UUID NOT NULL REFERENCES users(id),
-- 	added_at TIMESTAMPZ NOT NULL DEFAULT NOW()
-- )
