import { Router } from 'express';

export function slotsRoutes(slotsHandler) {
  const router = Router();
  router.get('/slots', slotsHandler.list);
  router.get('/slots/all', slotsHandler.listAll);
  router.post('/slots', slotsHandler.create);
  return router;
}
