import { Router } from 'express';

// Internal proxy to G1 - Patients. Requires a valid user session (applied by
// the parent router). The frontend uses this to populate the patient selector.
export function patientsRoutes(patientsHandler) {
  const router = Router();

  router.get('/patients', patientsHandler.list);
  router.get('/patients/:id', patientsHandler.getById);
  router.post('/patients', patientsHandler.create);

  return router;
}
