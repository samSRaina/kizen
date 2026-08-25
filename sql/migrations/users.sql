CREATE TABLE users (
    id UUID  PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

	username     TEXT UNIQUE NOT NULL,
	email        TEXT NOT NULL,

	password_hash TEXT NOT NULL,

	created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
