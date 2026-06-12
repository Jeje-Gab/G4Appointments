import express from 'express';
import cors from 'cors';
import { buildRouter } from '../../routes/index.js';
import { errorHandler, notFoundHandler } from './errorHandler.js';

// Builds the Express application given the fully-wired dependencies
// (handlers + auth use cases). Kept free of process/listen concerns so it
// stays easy to test.
export function createApp(deps) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Lightweight health check (no auth).
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', module: 'G4 - Consultas' });
  });

  app.use(buildRouter(deps));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
