#!/bin/bash
set -e

echo "[init-db] Initializing databases..."

# 1. Create the auth database if it does not already exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE kizen_auth'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'kizen_auth')\gexec
EOSQL

echo "[init-db] Database kizen_auth verified/created."

# 2. Run application migrations on POSTGRES_DB (kizen_app)
if [ -d "/docker-entrypoint-initdb.d/migrations" ]; then
    echo "[init-db] Running migrations on $POSTGRES_DB..."
    for f in $(ls /docker-entrypoint-initdb.d/migrations/*.sql 2>/dev/null | sort); do
        echo "[init-db] Executing $f (Up section) on $POSTGRES_DB..."
        sed '/-- +goose Down/,$d' "$f" | psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"
    done
fi

echo "[init-db] Database initialization completed successfully."
