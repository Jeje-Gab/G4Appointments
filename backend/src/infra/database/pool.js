import pg from 'pg';
import { env } from '../../config/env.js';

const { Pool } = pg;

// Single shared connection pool for the whole application.
// If DATABASE_URL is set we use it directly, otherwise we build the config
// from the discrete PG* variables.
const poolConfig = env.database.connectionString
  ? { connectionString: env.database.connectionString }
  : {
      host: env.database.host,
      port: env.database.port,
      user: env.database.user,
      password: env.database.password,
      database: env.database.database,
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  // Unexpected error on idle clients — log it; the pool will recover.
  // eslint-disable-next-line no-console
  console.error('[pg] unexpected idle client error:', err.message);
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function closePool() {
  await pool.end();
}
