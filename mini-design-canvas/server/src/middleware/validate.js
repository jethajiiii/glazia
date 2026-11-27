import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';

/**
 * Generic validation middleware factory using Zod schemas.
 * Validates req.body, req.params, and/or req.query.
 *
 * @param {object} schemas
 * @param {z.ZodTypeAny} [schemas.body] - Zod schema for req.body
 * @param {z.ZodTypeAny} [schemas.params] - Zod schema for req.params
 * @param {z.ZodTypeAny} [schemas.query] - Zod schema for req.query
 * @returns {Function} Express middleware function
 */
export function validate(schemas = {}) {
  return async (req, _res, next) => {
    try {
      const targets = ['body', 'params', 'query'];

      for (const target of targets) {
        const schema = schemas[target];
        if (schema) {
          req[target] = await schema.parseAsync(req[target]);
        }
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedDetails = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return next(ApiError.badRequest('Validation failed', formattedDetails));
      }

      next(error);
    }
  };
}
