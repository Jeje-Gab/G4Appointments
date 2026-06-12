-- Migration 005: seed an initial admin user so the app is usable right after
-- migrating, without needing the CLI to bootstrap.
--
-- Credentials:
--   username: admin
--   password: admin123
--
-- The password_hash below is a scrypt hash ('salt:hash') of 'admin123', produced
-- with the project's own hashPassword(). It is NOT reversible.
--
-- !!! SECURITY: these are PUBLIC default credentials (they live in the repo).
-- !!! Change the password immediately after first login (Admin -> Usuários),
-- !!! or create your own admin and remove/disable this one, before going to prod.
--
-- Idempotent: if an 'admin' user already exists, this does nothing.

INSERT INTO users (username, password_hash, role)
VALUES (
    'admin',
    '764a462348babafdd3331d5648a30619:22f246f82cd86eb1a7c56645578b7d3454efe5548ca6329dbb7d8938ce9075562db95f008d1a5f9486711a998d548eb0831dceee53c098f9367053b928988f8c',
    'admin'
)
ON CONFLICT (username) DO NOTHING;
