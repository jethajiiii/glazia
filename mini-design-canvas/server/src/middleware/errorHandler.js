import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';

/**
 * Central Express error handling middleware.
 * Maps ApiError, ZodError, and Mongoose errors to a consistent JSON response shape.
 */
export function errorHandler(err, _req, res, _next) {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof z.ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err.name === 'ValidationError') {
    // Mongoose schema validation failure
    statusCode = 400;
    message = 'Database validation failed';
    details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err.name === 'CastError') {
    // Mongoose invalid ObjectId / type casting failure
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
    details = { value: err.value };
  } else if (err.code === 11000) {
    // Mongoose duplicate key error
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${duplicatedField} already exists`;
    details = err.keyValue;
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Payload too large';
  } else if (err.statusCode && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
    message = err.message || message;
    details = err.details || null;
  } else {
    // Log unexpected errors for operational tracking
    console.error('[Unhandled Exception]', err);
  }

  const response = {
    success: false,
    message,
    ...(details !== null && { details }),
    ...(!config.isProduction && { stack: err.stack }),
  };

  return res.status(statusCode).json(response);
}
