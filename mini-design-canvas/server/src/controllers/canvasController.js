import * as canvasService from '../services/canvasService.js';

/**
 * Canvas Controller
 * Thin HTTP layer that delegates to canvasService and shapes uniform JSON responses.
 */

/**
 * POST /api/canvases
 */
export async function createCanvas(req, res) {
  const canvas = await canvasService.createCanvas(req.body);
  return res.status(201).json({
    success: true,
    data: canvas,
  });
}

/**
 * GET /api/canvases
 */
export async function listCanvases(_req, res) {
  const canvases = await canvasService.listCanvases();
  return res.status(200).json({
    success: true,
    count: canvases.length,
    data: canvases,
  });
}

/**
 * GET /api/canvases/:id
 */
export async function getCanvasById(req, res) {
  const canvas = await canvasService.getCanvasById(req.params.id);
  return res.status(200).json({
    success: true,
    data: canvas,
  });
}

/**
 * PUT /api/canvases/:id
 */
export async function updateCanvas(req, res) {
  const canvas = await canvasService.updateCanvas(req.params.id, req.body);
  return res.status(200).json({
    success: true,
    data: canvas,
  });
}

/**
 * DELETE /api/canvases/:id
 */
export async function deleteCanvas(req, res) {
  await canvasService.deleteCanvas(req.params.id);
  return res.status(200).json({
    success: true,
    message: 'Canvas deleted successfully',
  });
}
