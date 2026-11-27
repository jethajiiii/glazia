import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import * as canvasService from '../src/services/canvasService.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './helpers/dbHelper.js';
import {
  createValidCanvasPayload,
  sampleRectElement,
} from './helpers/canvasFixtures.js';

const NON_EXISTENT_ID = '507f1f77bcf86cd799439011';

describe('canvasService unit tests', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  describe('createCanvas', () => {
    it('creates a canvas record in mongodb and returns a plain object', async () => {
      // Arrange
      const payload = createValidCanvasPayload({ name: 'Service Canvas' });

      // Act
      const result = await canvasService.createCanvas(payload);

      // Assert
      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.name).toBe('Service Canvas');
      expect(result.elements).toHaveLength(3);
    });
  });

  describe('listCanvases', () => {
    it('returns empty array when no canvases exist', async () => {
      // Act
      const result = await canvasService.listCanvases();

      // Assert
      expect(result).toEqual([]);
    });

    it('returns list of canvases sorted newest first with projection', async () => {
      // Arrange
      await canvasService.createCanvas(createValidCanvasPayload({ name: 'First' }));
      await canvasService.createCanvas(createValidCanvasPayload({ name: 'Second' }));

      // Act
      const result = await canvasService.listCanvases();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]._id).toBeDefined();
      expect(result[0].name).toBeDefined();
      expect(result[0].updatedAt).toBeDefined();
      expect(result[0].elements).toBeUndefined();
    });
  });

  describe('getCanvasById', () => {
    it('retrieves an existing canvas by id', async () => {
      // Arrange
      const created = await canvasService.createCanvas(createValidCanvasPayload());

      // Act
      const fetched = await canvasService.getCanvasById(created._id.toString());

      // Assert
      expect(fetched._id.toString()).toBe(created._id.toString());
      expect(fetched.name).toBe(created.name);
      expect(fetched.elements).toHaveLength(3);
    });

    it('throws ApiError 404 when canvas does not exist', async () => {
      // Act & Assert
      await expect(canvasService.getCanvasById(NON_EXISTENT_ID)).rejects.toMatchObject({
        statusCode: 404,
        message: expect.stringMatching(/not found/i),
      });
    });
  });

  describe('updateCanvas', () => {
    it('updates canvas fields and returns updated document', async () => {
      // Arrange
      const created = await canvasService.createCanvas(createValidCanvasPayload({ name: 'Old' }));

      // Act
      const updated = await canvasService.updateCanvas(created._id.toString(), {
        name: 'Updated Name',
        elements: [sampleRectElement],
      });

      // Assert
      expect(updated.name).toBe('Updated Name');
      expect(updated.elements).toHaveLength(1);
    });

    it('throws ApiError 404 when updating non-existent canvas', async () => {
      // Act & Assert
      await expect(
        canvasService.updateCanvas(NON_EXISTENT_ID, { name: 'Cannot Update' }),
      ).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('deleteCanvas', () => {
    it('removes canvas document and returns deleted document', async () => {
      // Arrange
      const created = await canvasService.createCanvas(createValidCanvasPayload({ name: 'To Delete' }));

      // Act
      const deleted = await canvasService.deleteCanvas(created._id.toString());

      // Assert
      expect(deleted._id.toString()).toBe(created._id.toString());

      // Verify it no longer exists
      await expect(canvasService.getCanvasById(created._id.toString())).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('throws ApiError 404 when deleting non-existent canvas', async () => {
      // Act & Assert
      await expect(canvasService.deleteCanvas(NON_EXISTENT_ID)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
