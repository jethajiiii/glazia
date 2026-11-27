import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware handling unmapped routes (404 Not Found).
 */
export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
