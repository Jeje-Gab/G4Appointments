import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'g4_consultations',
});

async function run() {
  const files = readdirSync(__dirname).filter((f) => f.endsWith('.sql')).sort();
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schedule_migrations (
        filename   VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    const { rows } = await client.query('SELECT filename FROM schedule_migrations');
    const applied = new Set(rows.map((r) => r.filename));

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) { console.log(`= skip   ${file}`); continue; }
      const sql = readFileSync(join(__dirname, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schedule_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`+ apply  ${file}`);
        count++;
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration failed on ${file}: ${err.message}`);
      }
    }
    console.log(count === 0 ? 'Database already up to date.' : `Applied ${count} migration(s).`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => { console.error('[migrate] error:', err.message); process.exit(1); });
