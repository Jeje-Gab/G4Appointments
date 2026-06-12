-- Migration 003: admin users + sessions for the API-key management screen.
-- Passwords are stored as scrypt hashes (salt:hash). Sessions are opaque
-- random tokens; we store only the SHA-256 hash of the token and an expiry.

CREATE TABLE IF NOT EXISTS admin_users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(60)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,                 -- 'salt:hash' (scrypt)
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash VARCHAR(64) PRIMARY KEY,                  -- sha256(raw token), hex
    admin_id   UUID        NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_sessions_admin_id_idx ON admin_sessions (admin_id);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx ON admin_sessions (expires_at);
