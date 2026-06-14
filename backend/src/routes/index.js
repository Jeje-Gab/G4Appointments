import { Router } from 'express';
import { consultationsRoutes } from './consultations.routes.js';
import { patientsRoutes } from './patients.routes.js';
import { slotsRoutes } from './slots.routes.js';
import { externalRoutes } from './external.routes.js';
import { adminRoutes } from './admin.routes.js';
import { authRoutes } from './auth.routes.js';
import { authenticate, requireRole } from '../infra/http/authMiddleware.js';

// Aggregates all surfaces and applies the right auth to each:
//   /api/auth/*      -> login (open) / logout / me
//   /api/admin/*     -> API key management — requires session + role 'admin'
//   /api/*           -> internal consultations CRUD — requires a session (admin | user)
//   /external/v1/*   -> public, read-only API for other modules — requires API key
export function buildRouter(deps) {
  const {
    consultationHandler,
    patientsHandler,
    slotsHandler,
    adminHandler,
    authHandler,
    authenticateApiKeyUseCase,
    authenticateSessionUseCase,
  } = deps;

  // Build the session middlewares from the use cases (composition at the edge).
  const session = authenticate(authenticateSessionUseCase);
  const adminOnly = requireRole('admin');

  const router = Router();

  // Order matters: more specific /api/auth and /api/admin before generic /api.
  router.use('/api/auth', authRoutes(authHandler, session));
  router.use('/api/admin', adminRoutes(adminHandler, session, adminOnly));

  // Internal consultations + patients proxy: any authenticated user (admin or user).
  router.use('/api', session, consultationsRoutes(consultationHandler));
  router.use('/api', session, patientsRoutes(patientsHandler));
  router.use('/api', session, slotsRoutes(slotsHandler));

  // External, read-only, API-key protected.
  router.use('/external/v1', externalRoutes(consultationHandler, authenticateApiKeyUseCase));

  return router;
}
