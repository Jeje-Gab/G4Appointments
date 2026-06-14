import express from 'express';
import cors from 'cors';
import { SlotsHandler } from './handlers/SlotsHandler.js';
import { SlotsRepository } from './database/SlotsRepository.js';
import { pool } from './database/pool.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const handler = new SlotsHandler(new SlotsRepository(pool));

  app.get('/health', (req, res) => res.json({ status: 'ok', module: 'G4 - Schedule' }));

  app.get('/slots', handler.list);
  app.post('/slots', handler.create);
  app.get('/slots/:id', handler.getById);
  app.post('/slots/:id/reserve', handler.reserve);
  app.post('/slots/:id/release', handler.release);

  app.use((req, res) => res.status(404).json({ error: true, message: `Route not found: ${req.method} ${req.originalUrl}` }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[error]', err);
    res.status(500).json({ error: true, message: 'Internal server error.' });
  });

  return app;
}
