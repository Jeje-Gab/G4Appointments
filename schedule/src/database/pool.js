import pg from 'pg';
import { env } from '../config/env.js';

export const pool = new pg.Pool(
  env.database.connectionString
    ? { connectionString: env.database.connectionString }
    : {
        host: env.database.host,
        port: env.database.port,
        user: env.database.user,
        password: env.database.password,
        database: env.database.database,
      },
);

export async function closePool() {
  await pool.end();
}
