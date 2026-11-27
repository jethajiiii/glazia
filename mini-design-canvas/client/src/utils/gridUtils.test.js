import { describe, it, expect } from 'vitest';
import { snapToGrid, snapPoint } from './gridUtils.js';

describe('gridUtils', () => {
  describe('snapToGrid', () => {
    it('snaps coordinates to the default grid size (20px)', () => {
      expect(snapToGrid(0)).toBe(0);
      expect(snapToGrid(8)).toBe(0);
      expect(snapToGrid(11)).toBe(20);
      expect(snapToGrid(20)).toBe(20);
      expect(snapToGrid(35)).toBe(40);
      expect(snapToGrid(48)).toBe(40);
      expect(snapToGrid(51)).toBe(60);
    });

    it('respects custom grid sizes', () => {
      expect(snapToGrid(14, 10)).toBe(10);
      expect(snapToGrid(16, 10)).toBe(20);
      expect(snapToGrid(42, 50)).toBe(50);
      expect(snapToGrid(24, 50)).toBe(0);
    });

    it('handles negative coordinates correctly', () => {
      expect(snapToGrid(-8)).toBe(-0);
      expect(snapToGrid(-11)).toBe(-20);
      expect(snapToGrid(-25)).toBe(-20);
      expect(snapToGrid(-35)).toBe(-40);
    });

    it('returns unmodified value if input is invalid or grid size is non-positive', () => {
      expect(snapToGrid('abc')).toBe('abc');
      expect(snapToGrid(NaN)).toBeNaN();
      expect(snapToGrid(15, 0)).toBe(15);
      expect(snapToGrid(15, -10)).toBe(15);
    });
  });

  describe('snapPoint', () => {
    it('snaps both x and y coordinates of a point object', () => {
      const snapped = snapPoint({ x: 23, y: 38 });
      expect(snapped).toEqual({ x: 20, y: 40 });
    });

    it('preserves other properties on the object', () => {
      const snapped = snapPoint({ x: 19, y: 21, id: 'el-1', type: 'rect' });
      expect(snapped).toEqual({ x: 20, y: 20, id: 'el-1', type: 'rect' });
    });

    it('returns unmodified input if not an object', () => {
      expect(snapPoint(null)).toBeNull();
      expect(snapPoint(undefined)).toBeUndefined();
    });
  });
});
