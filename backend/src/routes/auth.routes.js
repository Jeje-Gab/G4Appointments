import { Router } from 'express';

// Authentication routes (any role). Mounted at /api/auth.
//   POST /login   -> open, returns a session token
//   POST /logout  -> requires session
//   GET  /me      -> requires session
export function authRoutes(authHandler, authMiddleware) {
  const router = Router();

  router.post('/login', authHandler.login);
  router.post('/logout', authMiddleware, authHandler.logout);
  router.get('/me', authMiddleware, authHandler.me);

  return router;
}
