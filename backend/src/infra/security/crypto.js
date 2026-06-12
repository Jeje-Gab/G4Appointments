import crypto from 'node:crypto';

// Security primitives built on Node's standard crypto — no external deps.
//
// - API keys / session tokens are high-entropy random strings, so a fast
//   SHA-256 hash is appropriate for storage (we only need to look them up).
// - Passwords are low-entropy and human-chosen, so we use scrypt (slow,
//   salted) to make brute-force expensive.

// ---- API keys (for external modules) ----
export function generateApiKey() {
  // 24 random bytes -> 48 hex chars, prefixed so it's recognizable.
  return `g4_${crypto.randomBytes(24).toString('hex')}`;
}

export function keyPrefix(rawKey) {
  return rawKey.slice(0, 12);
}

// ---- Opaque session tokens (for admin login) ----
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Generic SHA-256 used to store both api keys and session tokens.
export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

// ---- Passwords (admin users) ----
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  // Constant-time comparison to avoid timing attacks.
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}
