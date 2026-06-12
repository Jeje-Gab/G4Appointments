import { Router } from 'express';

// Builds the consultation routes given a handler instance.
export function consultationsRoutes(handler) {
  const router = Router();

  router.post('/consultations', handler.create);
  router.get('/consultations', handler.list);
  router.get('/consultations/:id', handler.getById);
  router.patch('/consultations/:id/status', handler.updateStatus);
  router.delete('/consultations/:id', handler.cancel);

  // History endpoint consumed by downstream modules.
  router.get('/patients/:patientId/consultations/history', handler.patientHistory);

  return router;
}
