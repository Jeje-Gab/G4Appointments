import { Router } from 'express';
import { apiKeyAuth } from '../infra/http/authMiddleware.js';

// External, versioned, read-only API consumed by other modules
// (G5, G7, G10, G11, G13). Protected by API key. This is the public contract:
// keep it stable. Mounted at /external/v1.
export function externalRoutes(consultationHandler, authenticateApiKeyUseCase) {
  const router = Router();

  // Every external route requires a valid API key.
  router.use(apiKeyAuth(authenticateApiKeyUseCase));

  router.get('/consultations', consultationHandler.list);
  router.get('/consultations/:id', consultationHandler.getById);
  router.get('/patients/:patientId/consultations/history', consultationHandler.patientHistory);

  return router;
}
