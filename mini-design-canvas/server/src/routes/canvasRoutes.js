import { Router } from 'express';
import * as canvasController from '../controllers/canvasController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
  createCanvasSchema,
  updateCanvasSchema,
  canvasIdParamSchema,
} from '../validators/canvasSchema.js';

const router = Router();

// Create a new canvas
router.post('/', validate(createCanvasSchema), asyncHandler(canvasController.createCanvas));

// List all saved canvases (minimal projection)
router.get('/', asyncHandler(canvasController.listCanvases));

// Retrieve a specific canvas by ID
router.get('/:id', validate(canvasIdParamSchema), asyncHandler(canvasController.getCanvasById));

// Update a canvas by ID
router.put('/:id', validate(updateCanvasSchema), asyncHandler(canvasController.updateCanvas));

// Delete a canvas by ID
router.delete('/:id', validate(canvasIdParamSchema), asyncHandler(canvasController.deleteCanvas));

export default router;
