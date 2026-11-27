import { describe, it, expect } from 'vitest';
import { formatApiError } from './errorUtils.js';

describe('errorUtils - formatApiError', () => {
  it('returns fallback message when error is null or undefined', () => {
    expect(formatApiError(null)).toBe('An unexpected error occurred.');
    expect(formatApiError(undefined)).toBe('An unexpected error occurred.');
  });

  it('formats network failure (status 0)', () => {
    const error = { status: 0, message: 'Network failed' };
    expect(formatApiError(error)).toContain('Unable to connect to server');
  });

  it('formats 400 Bad Request with field details array', () => {
    const error = {
      status: 400,
      message: 'Validation failed',
      details: [
        { field: 'name', message: 'Name is required' },
        { field: 'width', message: 'Must be positive' },
      ],
    };
    const formatted = formatApiError(error);
    expect(formatted).toContain('Validation failed: name: Name is required, width: Must be positive');
  });

  it('formats 400 Bad Request without details array', () => {
    const error = { status: 400, message: 'Invalid payload structure' };
    expect(formatApiError(error)).toBe('Invalid payload structure');
  });

  it('formats 404 Not Found cleanly', () => {
    const error = { status: 404, message: 'Not found' };
    expect(formatApiError(error)).toBe('The requested canvas was not found. It may have been deleted.');
  });

  it('formats 409 Conflict', () => {
    const error = { status: 409, message: 'Canvas name already exists' };
    expect(formatApiError(error)).toBe('Canvas name already exists');
  });

  it('formats 500+ Server Errors cleanly without exposing internals', () => {
    const error = { status: 500, message: 'Database connection pool exhausted' };
    expect(formatApiError(error)).toBe('A server error occurred. Please try again in a few moments.');
  });

  it('falls back to standard Error message when no status is present', () => {
    const error = new Error('Custom client exception');
    expect(formatApiError(error)).toBe('Custom client exception');
  });
});
