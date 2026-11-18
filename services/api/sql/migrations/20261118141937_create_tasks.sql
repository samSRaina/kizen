-- +goose Up
CREATE TABLE IF NOT EXISTS tasks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_num    BIGINT NOT NULL,
    identifier  VARCHAR(64) NOT NULL,
    title       TEXT NOT NULL,
    description TEXT,
    type        VARCHAR(32) NOT NULL DEFAULT 'task',
    status      VARCHAR(32) NOT NULL DEFAULT 'backlog',
    priority    VARCHAR(32) NOT NULL DEFAULT 'Medium',
    position    DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_project_identifier ON tasks (project_id, identifier);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_project_task_num ON tasks (project_id, task_num);
CREATE INDEX IF NOT EXISTS idx_tasks_project_position ON tasks (project_id, position ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_project_created ON tasks (project_id, created_at DESC);

-- +goose Down
DROP TABLE IF EXISTS tasks;
