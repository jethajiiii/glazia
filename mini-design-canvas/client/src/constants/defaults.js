import { ELEMENT_TYPES } from './elementTypes.js';

/**
 * Default dimensions and constraints for the drawing canvas.
 */
export const CANVAS_DEFAULTS = Object.freeze({
  WIDTH: 800,
  HEIGHT: 600,
  MIN_WIDTH: 100,
  MAX_WIDTH: 10000,
  MIN_HEIGHT: 100,
  MAX_HEIGHT: 10000,
  NAME: 'Untitled Design',
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  BACKGROUND_COLOR: '#ffffff',
});

/**
 * Initial creation properties for each element type.
 */
export const ELEMENT_DEFAULTS = Object.freeze({
  [ELEMENT_TYPES.RECT]: {
    type: ELEMENT_TYPES.RECT,
    width: 120,
    height: 80,
    fill: '#3b82f6',
    rotation: 0,
  },
  [ELEMENT_TYPES.CIRCLE]: {
    type: ELEMENT_TYPES.CIRCLE,
    radius: 45,
    fill: '#10b981',
    rotation: 0,
  },
  [ELEMENT_TYPES.TEXT]: {
    type: ELEMENT_TYPES.TEXT,
    text: 'Double-click to edit',
    fontSize: 20,
    fill: '#0f172a',
    rotation: 0,
  },
});

/**
 * Physical boundary limits for element properties.
 */
export const ELEMENT_BOUNDS = Object.freeze({
  MIN_DIMENSION: 10,
  MAX_DIMENSION: 5000,
  MIN_RADIUS: 5,
  MAX_RADIUS: 2500,
  MIN_FONT_SIZE: 8,
  MAX_FONT_SIZE: 200,
  MIN_ROTATION: -360,
  MAX_ROTATION: 360,
});

/**
 * Curated color palette presets (Stitch Whiteboard system).
 */
export const PRESET_COLORS = Object.freeze([
  '#1a1b22', // Dark Slate
  '#004ac6', // Navy Brand Blue
  '#e8e7f1', // Light Gray
  '#e11d48', // Coral Red
  '#fd761a', // Warm Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald Green
  '#2563eb', // Electric Blue
  '#8b5cf6', // Violet Purple
  '#ffffff', // Pure White
  '#64748b', // Slate 500
  '#ec4899', // Pink
]);

/**
 * Grid overlay and snap-to-grid configuration.
 */
export const GRID_CONFIG = Object.freeze({
  /** Grid cell size in canvas pixels. */
  SIZE: 20,
  /** Colour of the grid lines. */
  STROKE: '#c8d4e8',
  /** Opacity of grid lines (0–1). */
  OPACITY: 0.6,
});

/**
 * Named keyboard key identifiers for hotkeys and accessibility navigation.
 */
export const KEYBOARD_KEYS = Object.freeze({
  DELETE: 'Delete',
  BACKSPACE: 'Backspace',
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  KEY_Z: 'z',
  KEY_Y: 'y',
});
