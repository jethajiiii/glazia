/**
 * Higher-order function wrapping async route handlers.
 * Catches unhandled promise rejections and forwards them to Express next() pipeline,
 * eliminating repetitive try/catch blocks in controllers.
 *
 * @param {Function} fn - Async controller or middleware function (req, res, next)
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
