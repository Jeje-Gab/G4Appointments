import { env } from './config/env.js';
import { pool, closePool } from './database/pool.js';
import { createApp } from './app.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[server] G4 - Schedule API listening on http://localhost:${env.port}`);
});

function shutdown(signal) {
  console.log(`\n[server] ${signal} received, shutting down...`);
  server.close(async () => {
    await closePool().catch(() => {});
    process.exit(0);
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
