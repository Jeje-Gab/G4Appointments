-- Migration 002: API clients (credentials for external modules that consume G4).
-- One row per consumer group (G5, G7, G10, G11, G13...). We never store the raw
-- key, only its SHA-256 hash; the key is shown once at creation time.

CREATE TABLE IF NOT EXISTS api_clients (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(100) NOT NULL,                 -- e.g. 'G10 - Faturamento'
    key_hash     VARCHAR(64)  NOT NULL UNIQUE,          -- sha256(raw key), hex
    key_prefix   VARCHAR(16)  NOT NULL,                 -- first chars, for log/identification
    scopes       TEXT[]       NOT NULL DEFAULT ARRAY['read']::text[],
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ  NULL,
    revoked_at   TIMESTAMPTZ  NULL
);

CREATE INDEX IF NOT EXISTS api_clients_key_hash_idx ON api_clients (key_hash);
