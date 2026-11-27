import { GRID_CONFIG } from '../constants/defaults.js';

/**
 * Snaps a 1D scalar coordinate value to the nearest grid step.
 *
 * @param {number} value - Raw coordinate
 * @param {number} [gridSize=GRID_CONFIG.SIZE] - Grid cell dimension in pixels
 * @returns {number} Snapped coordinate
 */
export function snapToGrid(value, gridSize = GRID_CONFIG.SIZE) {
  if (typeof value !== 'number' || Number.isNaN(value) || gridSize <= 0) {
    return value;
  }
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snaps an (x, y) point coordinate pair to the grid.
 *
 * @param {{ x: number, y: number }} point
 * @param {number} [gridSize=GRID_CONFIG.SIZE]
 * @returns {{ x: number, y: number }}
 */
export function snapPoint(point, gridSize = GRID_CONFIG.SIZE) {
  if (!point || typeof point !== 'object') return point;
  return {
    ...point,
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize),
  };
}
