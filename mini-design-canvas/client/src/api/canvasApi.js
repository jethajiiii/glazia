import { httpClient } from './httpClient.js';

/**
 * Canvas REST API client methods for remote persistence.
 */
export const canvasApi = {
  /**
   * Retrieves summary list of all saved canvases.
   *
   * @param {AbortSignal} [signal]
   * @returns {Promise<{ success: boolean, count: number, data: Array<{ _id: string, name: string, updatedAt: string }> }>}
   */
  listCanvases: (signal) => httpClient.get('/canvases', { signal }),

  /**
   * Retrieves full canvas data by ID.
   *
   * @param {string} id - Canvas ObjectId
   * @param {AbortSignal} [signal]
   * @returns {Promise<{ success: boolean, data: object }>}
   */
  getCanvas: (id, signal) => httpClient.get(`/canvases/${id}`, { signal }),

  /**
   * Creates and persists a new canvas.
   *
   * @param {object} payload - Canvas payload { name, width, height, elements }
   * @param {AbortSignal} [signal]
   * @returns {Promise<{ success: boolean, data: object }>}
   */
  createCanvas: (payload, signal) => httpClient.post('/canvases', payload, { signal }),

  /**
   * Updates an existing canvas by ID.
   *
   * @param {string} id - Canvas ObjectId
   * @param {object} payload - Canvas update fields
   * @param {AbortSignal} [signal]
   * @returns {Promise<{ success: boolean, data: object }>}
   */
  updateCanvas: (id, payload, signal) => httpClient.put(`/canvases/${id}`, payload, { signal }),

  /**
   * Deletes a canvas by ID.
   *
   * @param {string} id - Canvas ObjectId
   * @param {AbortSignal} [signal]
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  deleteCanvas: (id, signal) => httpClient.delete(`/canvases/${id}`, { signal }),
};
