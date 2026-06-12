// Simple migration runner: executes every *.sql file in this folder in
// alphabetical order, exactly once, tracking applied files in a control table.
//
// Usage: npm run migrate
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, closePool } from '../src/infra/database/pool.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function ensureControlTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function appliedMigrations(client) {
  const { rows } = await client.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map((r) => r.filename));
}

async function run() {
  const files = readdirSync(__dirname)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const client = await pool.connect();
  try {
    await ensureControlTable(client);
    const applied = await appliedMigrations(client);

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`= skip   ${file} (already applied)`);
        continue;
      }

      const sql = readFileSync(join(__dirname, file), 'utf8');
      // Each migration runs in its own transaction.
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
        console.log(`+ apply  ${file}`);
        count += 1;
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration failed on ${file}: ${err.message}`);
      }
    }

    console.log(count === 0 ? 'Database already up to date.' : `Applied ${count} migration(s).`);
  } finally {
    client.release();
    await closePool();
  }
}

run().catch((err) => {
  console.error('[migrate] error:', err.message);
  process.exit(1);
});
