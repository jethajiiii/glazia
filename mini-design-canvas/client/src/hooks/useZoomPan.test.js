import { describe, it, expect } from 'vitest';
import {
  clamp,
  calculateNewScale,
  calculateZoomPoint,
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_KEY_STEP,
  ZOOM_STEP,
} from './useZoomPan.js';

describe('useZoomPan logic and math utilities', () => {
  describe('clamp', () => {
    it('keeps values within range unchanged', () => {
      expect(clamp(1.5, 0.5, 2.0)).toBe(1.5);
    });

    it('clamps values below minimum to minimum', () => {
      expect(clamp(0.05, 0.1, 5)).toBe(0.1);
    });

    it('clamps values above maximum to maximum', () => {
      expect(clamp(10, 0.1, 5)).toBe(5);
    });
  });

  describe('calculateNewScale', () => {
    it('increases scale when scrolling up (negative deltaY)', () => {
      const initial = 1.0;
      const deltaY = -100;
      const result = calculateNewScale(initial, deltaY);

      expect(result).toBeGreaterThan(initial);
      expect(result).toBeCloseTo(1.0 + 100 * ZOOM_STEP);
    });

    it('decreases scale when scrolling down (positive deltaY)', () => {
      const initial = 1.0;
      const deltaY = 100;
      const result = calculateNewScale(initial, deltaY);

      expect(result).toBeLessThan(initial);
      expect(result).toBeCloseTo(1.0 - 100 * ZOOM_STEP);
    });

    it('does not exceed ZOOM_MAX even with large negative deltaY', () => {
      const result = calculateNewScale(4.5, -100000);
      expect(result).toBe(ZOOM_MAX);
    });

    it('does not drop below ZOOM_MIN even with large positive deltaY', () => {
      const result = calculateNewScale(0.2, 100000);
      expect(result).toBe(ZOOM_MIN);
    });
  });

  describe('calculateZoomPoint', () => {
    it('keeps the mouse point stationary after scaling', () => {
      const pointer = { x: 400, y: 300 };
      const currentPos = { x: 0, y: 0 };
      const oldScale = 1.0;
      const newScale = 2.0;

      const newPos = calculateZoomPoint(pointer, currentPos, oldScale, newScale);

      // Point in stage coordinates before zoom: (400 - 0) / 1 = 400
      // After zoom: pointer.x - (400 * 2) = 400 - 800 = -400
      expect(newPos.x).toBe(-400);
      expect(newPos.y).toBe(-300);

      // Verify that after moving stage to newPos, pointer still maps to (400, 300) in stage coords
      const mappedX = (pointer.x - newPos.x) / newScale;
      const mappedY = (pointer.y - newPos.y) / newScale;
      expect(mappedX).toBe(400);
      expect(mappedY).toBe(300);
    });

    it('handles non-zero initial stage positions correctly', () => {
      const pointer = { x: 250, y: 150 };
      const currentPos = { x: 50, y: 50 };
      const oldScale = 1.0;
      const newScale = 1.5;

      const newPos = calculateZoomPoint(pointer, currentPos, oldScale, newScale);

      const mappedX = (pointer.x - newPos.x) / newScale;
      const mappedY = (pointer.y - newPos.y) / newScale;

      const originalMappedX = (pointer.x - currentPos.x) / oldScale;
      const originalMappedY = (pointer.y - currentPos.y) / oldScale;

      expect(mappedX).toBeCloseTo(originalMappedX);
      expect(mappedY).toBeCloseTo(originalMappedY);
    });
  });

  describe('constants verification', () => {
    it('defines expected boundary constants', () => {
      expect(ZOOM_MIN).toBe(0.1);
      expect(ZOOM_MAX).toBe(5);
      expect(ZOOM_KEY_STEP).toBe(0.1);
      expect(ZOOM_STEP).toBe(0.001);
    });
  });
});
