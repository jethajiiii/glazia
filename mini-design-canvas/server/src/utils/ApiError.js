/**
 * Custom application error class representing operational HTTP errors.
 * Extends standard Error with HTTP status codes and structured details.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Descriptive error message
   * @param {any} [details=null] - Optional structured context or validation field errors
   */
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', details = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Resource conflict', details = null) {
    return new ApiError(409, message, details);
  }

  static unprocessableEntity(message = 'Unprocessable Entity', details = null) {
    return new ApiError(422, message, details);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}
