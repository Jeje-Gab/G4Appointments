import { ApiClientRepository } from '../../repositories/ApiClientRepository.js';
import { DatabaseError } from '../../errors/index.js';

function rowToClient(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    keyPrefix: row.key_prefix,
    scopes: row.scopes,
    active: row.active,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
  };
}

export class PostgresApiClientRepository extends ApiClientRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async create({ name, keyHash, keyPrefix, scopes = ['read'] }) {
    try {
      const { rows } = await this.pool.query(
        `INSERT INTO api_clients (name, key_hash, key_prefix, scopes)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, keyHash, keyPrefix, scopes],
      );
      return rowToClient(rows[0]);
    } catch (err) {
      throw new DatabaseError(err.message);
    }
  }

  async findActiveByKeyHash(keyHash) {
    const { rows } = await this.pool.query(
      `SELECT * FROM api_clients WHERE key_hash = $1 AND active = TRUE LIMIT 1`,
      [keyHash],
    );
    return rowToClient(rows[0]);
  }

  async list() {
    const { rows } = await this.pool.query(
      `SELECT * FROM api_clients ORDER BY created_at DESC`,
    );
    return rows.map(rowToClient);
  }

  async revoke(id) {
    const { rows } = await this.pool.query(
      `UPDATE api_clients
       SET active = FALSE, revoked_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id],
    );
    return rowToClient(rows[0]);
  }

  async touchLastUsed(id) {
    // Best-effort; never block the request on this.
    await this.pool
      .query(`UPDATE api_clients SET last_used_at = NOW() WHERE id = $1`, [id])
      .catch(() => {});
  }
}
