import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';
import app from '../src/app.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { ApiError } from '../src/utils/ApiError.js';

describe('Backend Hardening & Security', () => {
  describe('Rate Limiting', () => {
    it('blocks requests exceeding maximum allowance and sets rate limit headers', async () => {
      // Arrange: create an isolated app with strict rate limiter of 2 requests
      const testApp = express();
      const strictLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 2,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          message: 'Too many requests, please try again later.',
        },
      });

      testApp.use(strictLimiter);
      testApp.get('/test-rate', (_req, res) => res.json({ ok: true }));

      // Act & Assert
      // Request 1: ok
      const res1 = await request(testApp).get('/test-rate');
      expect(res1.status).toBe(200);
      expect(res1.headers['ratelimit-limit']).toBe('2');
      expect(res1.headers['ratelimit-remaining']).toBe('1');

      // Request 2: ok
      const res2 = await request(testApp).get('/test-rate');
      expect(res2.status).toBe(200);
      expect(res2.headers['ratelimit-remaining']).toBe('0');

      // Request 3: blocked with 429
      const res3 = await request(testApp).get('/test-rate');
      expect(res3.status).toBe(429);
      expect(res3.body.success).toBe(false);
      expect(res3.body.message).toMatch(/too many requests/i);
    });
  });

  describe('Request Body Size Limit', () => {
    it('rejects payloads exceeding the configured body limit with 413 Payload Too Large', async () => {
      // Arrange: create an app with 100-byte body limit
      const testApp = express();
      testApp.use(express.json({ limit: '100b' }));
      testApp.post('/test-body', (req, res) => res.json(req.body));
      testApp.use(errorHandler);

      // Oversized payload (> 100 bytes)
      const oversizedPayload = { data: 'x'.repeat(200) };

      // Act
      const res = await request(testApp).post('/test-body').send(oversizedPayload);

      // Assert
      expect(res.status).toBe(413);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/payload too large/i);
    });
  });

  describe('Production Mode Error Hardening', () => {
    it('never leaks stack traces or internal error details when in production mode', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const testApp = express();
      // Route throwing an unexpected internal error
      testApp.get('/crash', () => {
        throw new Error('Sensitive DB connection string: mongodb://secret@host');
      });
      testApp.use(errorHandler);

      // Suppress console.error in test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        // Act
        const res = await request(testApp).get('/crash');

        // Assert: status 500, message is generic, NO stack trace leaked
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Internal Server Error');
        expect(res.body.message).not.toMatch(/secret/);
        expect(res.body.stack).toBeUndefined();
      } finally {
        process.env.NODE_ENV = originalEnv;
        consoleSpy.mockRestore();
      }
    });

    it('returns ApiError details and message even in production when error is operational', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const testApp = express();
      testApp.get('/bad-input', () => {
        throw ApiError.badRequest('Invalid parameter supplied', { field: 'canvasId' });
      });
      testApp.use(errorHandler);

      try {
        // Act
        const res = await request(testApp).get('/bad-input');

        // Assert: 400 status, operational message preserved, stack omitted
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid parameter supplied');
        expect(res.body.details).toEqual({ field: 'canvasId' });
        expect(res.body.stack).toBeUndefined();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe('404 Unknown Routes & Health Check', () => {
    it('returns 404 for unknown endpoints', async () => {
      // Act
      const res = await request(app).get('/api/unknown-endpoint-xyz');

      // Assert
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('returns 200 operational status from /api/health', async () => {
      // Act
      const res = await request(app).get('/api/health');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
