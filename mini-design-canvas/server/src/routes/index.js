import { Router } from 'express';

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

export default router;
