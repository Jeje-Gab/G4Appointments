-- Migration 004: turn admin-only auth into role-based users (admin | user).
-- Renames the tables to a generic name and adds a role column.

ALTER TABLE admin_users    RENAME TO users;
ALTER TABLE admin_sessions RENAME TO user_sessions;
ALTER TABLE user_sessions  RENAME COLUMN admin_id TO user_id;

ALTER TABLE users ADD COLUMN role VARCHAR(20);

-- Accounts created before roles existed were all administrators (the only kind
-- that could be created). Backfill them as 'admin'.
UPDATE users SET role = 'admin' WHERE role IS NULL;

ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user'));
