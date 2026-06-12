import { UserRepository } from '../../repositories/UserRepository.js';
import { DatabaseError } from '../../errors/index.js';

export class PostgresUserRepository extends UserRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async createUser({ username, passwordHash, role = 'user' }) {
    try {
      const { rows } = await this.pool.query(
        `INSERT INTO users (username, password_hash, role)
         VALUES ($1, $2, $3)
         RETURNING id, username, role, created_at`,
        [username, passwordHash, role],
      );
      return rows[0];
    } catch (err) {
      if (err.code === '23505') {
        throw new DatabaseError(`User "${username}" already exists.`);
      }
      throw new DatabaseError(err.message);
    }
  }

  async findUserByUsername(username) {
    const { rows } = await this.pool.query(
      `SELECT id, username, password_hash, role FROM users WHERE username = $1`,
      [username],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      role: row.role,
    };
  }

  async findUserById(id) {
    const { rows } = await this.pool.query(
      `SELECT id, username, role FROM users WHERE id = $1`,
      [id],
    );
    return rows[0] || null;
  }

  async listUsers() {
    const { rows } = await this.pool.query(
      `SELECT id, username, role, created_at FROM users ORDER BY created_at ASC`,
    );
    return rows.map((r) => ({
      id: r.id,
      username: r.username,
      role: r.role,
      createdAt: r.created_at,
    }));
  }

  async updatePassword(id, passwordHash) {
    const { rows } = await this.pool.query(
      `UPDATE users SET password_hash = $2 WHERE id = $1
       RETURNING id, username, role`,
      [id, passwordHash],
    );
    return rows[0] || null;
  }

  async createSession({ tokenHash, userId, expiresAt }) {
    await this.pool.query(
      `INSERT INTO user_sessions (token_hash, user_id, expires_at)
       VALUES ($1, $2, $3)`,
      [tokenHash, userId, expiresAt],
    );
  }

  async findValidSession(tokenHash) {
    const { rows } = await this.pool.query(
      `SELECT s.expires_at, u.id AS user_id, u.username, u.role
       FROM user_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
      [tokenHash],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      userId: row.user_id,
      username: row.username,
      role: row.role,
      expiresAt: row.expires_at,
    };
  }

  async deleteSession(tokenHash) {
    await this.pool.query(`DELETE FROM user_sessions WHERE token_hash = $1`, [tokenHash]);
  }

  async deleteUserSessions(userId) {
    await this.pool.query(`DELETE FROM user_sessions WHERE user_id = $1`, [userId]);
  }
}
