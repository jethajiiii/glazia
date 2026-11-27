import { Canvas } from '../models/Canvas.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Service managing canvas persistence and data operations.
 * Decoupled from HTTP req/res objects for pure testability and reusability.
 */

/**
 * Creates a new canvas document.
 *
 * @param {object} canvasData - Validated canvas creation data
 * @returns {Promise<object>} Created canvas document object
 */
export async function createCanvas(canvasData) {
  const canvas = await Canvas.create(canvasData);
  return canvas.toObject();
}

/**
 * Lists all canvases with a minimal projection for dashboard performance.
 * Sorted newest first (updatedAt descending).
 *
 * @returns {Promise<Array<{ _id: string, name: string, updatedAt: Date }>>}
 */
export async function listCanvases() {
  return Canvas.find({}, '_id name updatedAt').sort({ updatedAt: -1 }).lean();
}

/**
 * Retrieves a canvas by its unique ID.
 *
 * @param {string} id - Canvas ObjectId string
 * @returns {Promise<object>} Canvas document
 * @throws {ApiError} 404 if canvas does not exist
 */
export async function getCanvasById(id) {
  const canvas = await Canvas.findById(id).lean();

  if (!canvas) {
    throw ApiError.notFound(`Canvas with id '${id}' not found`);
  }

  return canvas;
}

/**
 * Updates an existing canvas by ID.
 *
 * @param {string} id - Canvas ObjectId string
 * @param {object} updateData - Validated update fields
 * @returns {Promise<object>} Updated canvas document
 * @throws {ApiError} 404 if canvas does not exist
 */
export async function updateCanvas(id, updateData) {
  const updatedCanvas = await Canvas.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updatedCanvas) {
    throw ApiError.notFound(`Canvas with id '${id}' not found`);
  }

  return updatedCanvas;
}

/**
 * Deletes a canvas by ID.
 *
 * @param {string} id - Canvas ObjectId string
 * @returns {Promise<object>} Deleted canvas document
 * @throws {ApiError} 404 if canvas does not exist
 */
export async function deleteCanvas(id) {
  const deletedCanvas = await Canvas.findByIdAndDelete(id).lean();

  if (!deletedCanvas) {
    throw ApiError.notFound(`Canvas with id '${id}' not found`);
  }

  return deletedCanvas;
}
