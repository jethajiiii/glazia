import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './helpers/dbHelper.js';
import {
  createValidCanvasPayload,
  sampleRectElement,
  sampleCircleElement,
  sampleTextElement,
} from './helpers/canvasFixtures.js';

const NON_EXISTENT_OBJECT_ID = '507f1f77bcf86cd799439011';
const INVALID_OBJECT_ID = 'invalid-hex-id-123';

describe('Canvas REST API Endpoints', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  describe('POST /api/canvases - Create Canvas', () => {
    it('creates a new canvas with rect, circle, and text elements and returns 201', async () => {
      // Arrange
      const payload = createValidCanvasPayload({ name: 'Architecture Blueprint' });

      // Act
      const res = await request(app).post('/api/canvases').send(payload);

      // Assert
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data._id).toBeDefined();
      expect(res.body.data.name).toBe('Architecture Blueprint');
      expect(res.body.data.width).toBe(800);
      expect(res.body.data.height).toBe(600);
      expect(res.body.data.elements).toHaveLength(3);
      expect(res.body.data.elements[0]).toMatchObject(sampleRectElement);
      expect(res.body.data.elements[1]).toMatchObject(sampleCircleElement);
      expect(res.body.data.elements[2]).toMatchObject(sampleTextElement);
    });

    it('returns 400 validation error when name is missing', async () => {
      // Arrange
      const invalidPayload = { width: 800, height: 600, elements: [] };

      // Act
      const res = await request(app).post('/api/canvases').send(invalidPayload);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/validation failed/i);
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'name' })]),
      );
    });

    it('returns 400 validation error when name is empty string or only whitespace', async () => {
      // Arrange
      const invalidPayload = createValidCanvasPayload({ name: '   ' });

      // Act
      const res = await request(app).post('/api/canvases').send(invalidPayload);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'name' })]),
      );
    });

    it('returns 400 validation error when name exceeds 100 characters', async () => {
      // Arrange
      const invalidPayload = createValidCanvasPayload({ name: 'A'.repeat(101) });

      // Act
      const res = await request(app).post('/api/canvases').send(invalidPayload);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 validation error for invalid rect element (missing width)', async () => {
      // Arrange
      const payload = createValidCanvasPayload({
        elements: [
          {
            id: 'bad-rect',
            type: 'rect',
            x: 10,
            y: 10,
            height: 50,
            fill: '#3b82f6',
          },
        ],
      });

      // Act
      const res = await request(app).post('/api/canvases').send(payload);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 validation error for invalid circle element (missing radius)', async () => {
      // Arrange
      const payload = createValidCanvasPayload({
        elements: [
          {
            id: 'bad-circle',
            type: 'circle',
            x: 20,
            y: 20,
            fill: '#10b981',
          },
        ],
      });

      // Act
      const res = await request(app).post('/api/canvases').send(payload);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 validation error for invalid text element (font size out of bounds)', async () => {
      // Arrange: fontSize below minimum of 6
      const payload = createValidCanvasPayload({
        elements: [
          {
            id: 'bad-text',
            type: 'text',
            x: 10,
            y: 10,
            text: 'Too small',
            fontSize: 2,
            fill: '#000000',
          },
        ],
      });

      // Act
      const res = await request(app).post('/api/canvases').send(payload);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 validation error for unsupported element type', async () => {
      // Arrange
      const payload = createValidCanvasPayload({
        elements: [
          {
            id: 'unknown-1',
            type: 'polygon',
            x: 0,
            y: 0,
            fill: '#ffffff',
          },
        ],
      });

      // Act
      const res = await request(app).post('/api/canvases').send(payload);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/canvases - List Canvases', () => {
    it('returns empty list when no canvases exist', async () => {
      // Act
      const res = await request(app).get('/api/canvases');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });

    it('returns list of saved canvases with minimal projection (_id, name, updatedAt)', async () => {
      // Arrange: create two canvases
      await request(app).post('/api/canvases').send(createValidCanvasPayload({ name: 'Canvas One' }));
      await request(app).post('/api/canvases').send(createValidCanvasPayload({ name: 'Canvas Two' }));

      // Act
      const res = await request(app).get('/api/canvases');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);

      const firstItem = res.body.data[0];
      expect(firstItem._id).toBeDefined();
      expect(firstItem.name).toBeDefined();
      expect(firstItem.updatedAt).toBeDefined();
      // Elements array should not be projected in list view
      expect(firstItem.elements).toBeUndefined();
    });
  });

  describe('GET /api/canvases/:id - Get Canvas By ID', () => {
    it('returns 200 with full canvas data when valid id exists', async () => {
      // Arrange: create a canvas
      const created = await request(app)
        .post('/api/canvases')
        .send(createValidCanvasPayload({ name: 'Fetchable Canvas' }));
      const canvasId = created.body.data._id;

      // Act
      const res = await request(app).get(`/api/canvases/${canvasId}`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(canvasId);
      expect(res.body.data.name).toBe('Fetchable Canvas');
      expect(res.body.data.elements).toHaveLength(3);
    });

    it('returns 400 when id is not a 24-character hex string', async () => {
      // Act
      const res = await request(app).get(`/api/canvases/${INVALID_OBJECT_ID}`);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/validation failed/i);
    });

    it('returns 404 when valid id does not exist in database', async () => {
      // Act
      const res = await request(app).get(`/api/canvases/${NON_EXISTENT_OBJECT_ID}`);

      // Assert
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found/i);
    });
  });

  describe('PUT /api/canvases/:id - Update Canvas', () => {
    it('updates name and elements and returns 200 with updated document', async () => {
      // Arrange
      const created = await request(app)
        .post('/api/canvases')
        .send(createValidCanvasPayload({ name: 'Original Name' }));
      const canvasId = created.body.data._id;

      const updatePayload = {
        name: 'Renamed Canvas',
        elements: [{ ...sampleRectElement, x: 99, y: 88 }],
      };

      // Act
      const res = await request(app).put(`/api/canvases/${canvasId}`).send(updatePayload);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Renamed Canvas');
      expect(res.body.data.elements).toHaveLength(1);
      expect(res.body.data.elements[0].x).toBe(99);
      expect(res.body.data.elements[0].y).toBe(88);
    });

    it('returns 400 when updating with empty body', async () => {
      // Arrange
      const created = await request(app)
        .post('/api/canvases')
        .send(createValidCanvasPayload());
      const canvasId = created.body.data._id;

      // Act
      const res = await request(app).put(`/api/canvases/${canvasId}`).send({});

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when id format is invalid', async () => {
      // Act
      const res = await request(app)
        .put(`/api/canvases/${INVALID_OBJECT_ID}`)
        .send({ name: 'New Name' });

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 404 when updating non-existent canvas', async () => {
      // Act
      const res = await request(app)
        .put(`/api/canvases/${NON_EXISTENT_OBJECT_ID}`)
        .send({ name: 'Ghost Canvas' });

      // Assert
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found/i);
    });
  });

  describe('DELETE /api/canvases/:id - Delete Canvas', () => {
    it('deletes an existing canvas and subsequent fetch returns 404', async () => {
      // Arrange
      const created = await request(app)
        .post('/api/canvases')
        .send(createValidCanvasPayload({ name: 'Canvas To Delete' }));
      const canvasId = created.body.data._id;

      // Act: Delete
      const deleteRes = await request(app).delete(`/api/canvases/${canvasId}`);

      // Assert delete response
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
      expect(deleteRes.body.message).toMatch(/deleted successfully/i);

      // Act & Assert subsequent GET
      const getRes = await request(app).get(`/api/canvases/${canvasId}`);
      expect(getRes.status).toBe(404);
    });

    it('returns 400 when delete id format is invalid', async () => {
      // Act
      const res = await request(app).delete(`/api/canvases/${INVALID_OBJECT_ID}`);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 404 when deleting non-existent canvas', async () => {
      // Act
      const res = await request(app).delete(`/api/canvases/${NON_EXISTENT_OBJECT_ID}`);

      // Assert
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found/i);
    });
  });
});
