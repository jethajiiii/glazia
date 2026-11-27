import { Router } from 'express';
import canvasRoutes from './canvasRoutes.js';

const router = Router();

/**
 * Health check endpoint.
 * Returns server operational status, current timestamp, and process uptime.
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Canvas resource routes mounted under /api/canvases
 */
router.use('/canvases', canvasRoutes);

export default router;
