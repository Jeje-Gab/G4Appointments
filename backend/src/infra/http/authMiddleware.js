import { UnauthorizedError, ForbiddenError } from '../../errors/index.js';

// Extracts a credential from the request: supports
//   Authorization: ApiKey <key>      (external API)
//   Authorization: Bearer <token>    (logged-in user session)
//   X-API-Key: <key>                 (convenience for the external API)
function extractCredential(req, { scheme }) {
  const header = req.get('authorization');
  if (header) {
    const [type, value] = header.split(' ');
    if (type && value && type.toLowerCase() === scheme.toLowerCase()) {
      return value.trim();
    }
  }
  if (scheme === 'ApiKey') {
    const xApiKey = req.get('x-api-key');
    if (xApiKey) return xApiKey.trim();
  }
  return null;
}

// Protects the external API: requires a valid API key. Sets req.apiClient.
export function apiKeyAuth(authenticateApiKeyUseCase) {
  return async (req, res, next) => {
    try {
      const key = extractCredential(req, { scheme: 'ApiKey' });
      if (!key) throw new UnauthorizedError('API key required (Authorization: ApiKey <key>).');
      req.apiClient = await authenticateApiKeyUseCase.execute(key);
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Protects internal/admin routes: requires a valid user session. Sets req.user
// ({ id, username, role }) and req.sessionToken.
export function authenticate(authenticateSessionUseCase) {
  return async (req, res, next) => {
    try {
      const token = extractCredential(req, { scheme: 'Bearer' });
      if (!token) {
        throw new UnauthorizedError('Authentication required (Authorization: Bearer <token>).');
      }
      req.user = await authenticateSessionUseCase.execute(token);
      req.sessionToken = token;
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Role-based guard. Use AFTER `authenticate`. Example: requireRole('admin').
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`Requires role: ${allowedRoles.join(' or ')}.`));
    }
    next();
  };
}
