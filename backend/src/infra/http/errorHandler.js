import { AppError } from '../../errors/index.js';

// 404 handler for unknown routes.
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: true,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    details: null,
  });
}

// Centralized error handler. Renders the consistent error envelope:
//   { error: true, message, details }
// Known AppErrors use their statusCode/code; anything else is a 500.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err && err.isAppError) {
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      code: err.code,
      details: err.details ?? null,
    });
  }

  // Unexpected error: log it server-side, hide internals from the client.
  // eslint-disable-next-line no-console
  console.error('[error] unhandled:', err);
  return res.status(500).json({
    error: true,
    message: 'Internal server error.',
    details: null,
  });
}

export { AppError };
