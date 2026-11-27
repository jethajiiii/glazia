import { ApiError } from '../utils/ApiError.js';

/**
 * Central Express error handling middleware.
 * Ensures consistent JSON error responses across all routes.
 */
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Handle Mongoose / Zod or unexpected exceptions
  console.error('[Unhandled Error]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message,
  });
}
