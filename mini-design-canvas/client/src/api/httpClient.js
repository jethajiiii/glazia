/**
 * Custom error class representing API communication or validation errors on client.
 */
export class ApiClientError extends Error {
  /**
   * @param {number} status - HTTP status code (or 0 for network failure)
   * @param {string} message - Descriptive error message
   * @param {any} [details=null] - Additional validation or error payload details
   */
  constructor(status, message, details = null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Core HTTP request handler.
 * Encapsulates JSON serialization, header defaults, AbortSignal support,
 * and uniform error parsing.
 *
 * @param {string} endpoint - Relative path (e.g. '/canvases')
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<any>} Parsed response data
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const fetchConfig = {
    ...options,
    headers,
  };

  if (
    fetchConfig.body &&
    typeof fetchConfig.body === 'object' &&
    !(fetchConfig.body instanceof FormData)
  ) {
    fetchConfig.body = JSON.stringify(fetchConfig.body);
  }

  let response;
  try {
    response = await fetch(url, fetchConfig);
  } catch (networkError) {
    if (networkError.name === 'AbortError') {
      throw networkError;
    }
    throw new ApiClientError(
      0,
      'Unable to connect to server. Please check your network connection.',
    );
  }

  let responseData;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    const message =
      (responseData && typeof responseData === 'object' && responseData.message) ||
      `Request failed with status ${response.status}`;
    const details =
      (responseData && typeof responseData === 'object' && responseData.details) || null;

    throw new ApiClientError(response.status, message, details);
  }

  return responseData;
}

export const httpClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
  request,
};
