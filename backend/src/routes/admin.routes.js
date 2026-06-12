import { Router } from 'express';

// Admin area: API key management. Mounted at /api/admin.
// Requires an authenticated user with the 'admin' role (adminOnly guard).
// This is the route a 'user' role cannot reach.
export function adminRoutes(adminHandler, authMiddleware, adminOnly) {
  const router = Router();

  // Every admin route requires a valid session AND the admin role.
  router.use(authMiddleware, adminOnly);

  // API key management
  router.get('/clients', adminHandler.listClients);
  router.post('/clients', adminHandler.createClient);
  router.post('/clients/:id/revoke', adminHandler.revokeClient);

  // User management (create users, reset passwords)
  router.get('/users', adminHandler.listUsers);
  router.post('/users', adminHandler.createUser);
  router.post('/users/:id/password', adminHandler.changeUserPassword);

  return router;
}
