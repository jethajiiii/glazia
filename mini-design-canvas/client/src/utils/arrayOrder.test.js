import { describe, it, expect } from 'vitest';
import {
  bringForward,
  sendBackward,
  bringToFront,
  sendToBack,
  reorderById,
} from './arrayOrder.js';

describe('arrayOrder utilities', () => {
  const initial = ['A', 'B', 'C', 'D'];

  describe('bringForward', () => {
    it('swaps an element with the one immediately after it', () => {
      const result = bringForward(initial, 1); // Move 'B' forward
      expect(result).toEqual(['A', 'C', 'B', 'D']);
      expect(initial).toEqual(['A', 'B', 'C', 'D']); // immutability
    });

    it('returns the same array if index is at the end of the array', () => {
      const result = bringForward(initial, 3);
      expect(result).toBe(initial);
    });

    it('returns the same array for invalid negative or out of bounds indices', () => {
      expect(bringForward(initial, -1)).toBe(initial);
      expect(bringForward(initial, 10)).toBe(initial);
      expect(bringForward(null, 1)).toBe(null);
    });
  });

  describe('sendBackward', () => {
    it('swaps an element with the one immediately preceding it', () => {
      const result = sendBackward(initial, 2); // Move 'C' backward
      expect(result).toEqual(['A', 'C', 'B', 'D']);
      expect(initial).toEqual(['A', 'B', 'C', 'D']);
    });

    it('returns the same array if index is at index 0', () => {
      const result = sendBackward(initial, 0);
      expect(result).toBe(initial);
    });

    it('returns the same array for invalid or out of bounds indices', () => {
      expect(sendBackward(initial, -1)).toBe(initial);
      expect(sendBackward(initial, 99)).toBe(initial);
    });
  });

  describe('bringToFront', () => {
    it('moves an element directly to the end of the array', () => {
      const result = bringToFront(initial, 1); // Move 'B' to end
      expect(result).toEqual(['A', 'C', 'D', 'B']);
    });

    it('returns original array if element is already at the end', () => {
      expect(bringToFront(initial, 3)).toBe(initial);
    });

    it('returns original array on out-of-bounds indices', () => {
      expect(bringToFront(initial, -2)).toBe(initial);
      expect(bringToFront(initial, 5)).toBe(initial);
    });
  });

  describe('sendToBack', () => {
    it('moves an element directly to index 0 of the array', () => {
      const result = sendToBack(initial, 2); // Move 'C' to start
      expect(result).toEqual(['C', 'A', 'B', 'D']);
    });

    it('returns original array if element is already at index 0', () => {
      expect(sendToBack(initial, 0)).toBe(initial);
    });

    it('returns original array on invalid indices', () => {
      expect(sendToBack(initial, -1)).toBe(initial);
      expect(sendToBack(initial, 100)).toBe(initial);
    });
  });

  describe('reorderById', () => {
    const elements = [
      { id: '1', name: 'Rect' },
      { id: '2', name: 'Circle' },
      { id: '3', name: 'Text' },
    ];

    it('applies bringForward by element id', () => {
      const result = reorderById(elements, '1', bringForward);
      expect(result.map((e) => e.id)).toEqual(['2', '1', '3']);
    });

    it('applies bringToFront by element id', () => {
      const result = reorderById(elements, '1', bringToFront);
      expect(result.map((e) => e.id)).toEqual(['2', '3', '1']);
    });

    it('applies sendToBack by element id', () => {
      const result = reorderById(elements, '3', sendToBack);
      expect(result.map((e) => e.id)).toEqual(['3', '1', '2']);
    });

    it('returns same array if element id is not found', () => {
      const result = reorderById(elements, 'non-existent', bringForward);
      expect(result).toBe(elements);
    });
  });
});
