/**
 * Converts raw errors or ApiClientError instances into clean, user-friendly messages.
 * Single source of truth for all API error messaging across the frontend.
 *
 * @param {any} error - Thrown error object or ApiClientError
 * @returns {string} User-presentable error message
 */
export function formatApiError(error) {
  if (!error) return 'An unexpected error occurred.';

  // If network unreachable (status 0)
  if (error.status === 0) {
    return 'Unable to connect to server. Please check your network or ensure backend is running.';
  }

  // If bad request (status 400)
  if (error.status === 400) {
    if (Array.isArray(error.details) && error.details.length > 0) {
      const fieldErrors = error.details
        .map((d) => (d.field ? `${d.field}: ${d.message}` : d.message))
        .filter(Boolean);
      if (fieldErrors.length > 0) {
        return `Validation failed: ${fieldErrors.join(', ')}`;
      }
    }
    return error.message || 'Invalid request. Please check your input parameters.';
  }

  // Not found (status 404)
  if (error.status === 404) {
    return 'The requested canvas was not found. It may have been deleted.';
  }

  // Conflict (status 409)
  if (error.status === 409) {
    return error.message || 'A conflicting resource already exists.';
  }

  // Server error (500+)
  if (typeof error.status === 'number' && error.status >= 500) {
    return 'A server error occurred. Please try again in a few moments.';
  }

  // Fallback to error message
  if (typeof error.message === 'string' && error.message.trim().length > 0) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
