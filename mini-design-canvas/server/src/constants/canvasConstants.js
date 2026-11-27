/**
 * Supported canvas element types.
 */
export const ELEMENT_TYPES = Object.freeze({
  RECT: 'rect',
  CIRCLE: 'circle',
  TEXT: 'text',
});

/**
 * Array of supported element type values for validation and schema enforcement.
 */
export const ALLOWED_ELEMENT_TYPES = Object.freeze(Object.values(ELEMENT_TYPES));

/**
 * Domain constants, boundaries and default values for canvases and elements.
 */
export const CANVAS_LIMITS = Object.freeze({
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  MIN_WIDTH: 100,
  MAX_WIDTH: 10000,
  MIN_HEIGHT: 100,
  MAX_HEIGHT: 10000,
  DEFAULT_FILL: '#3b82f6',
  MIN_ELEMENT_DIMENSION: 1,
  MAX_ELEMENT_DIMENSION: 10000,
  MIN_ROTATION: -360,
  MAX_ROTATION: 360,
  MIN_FONT_SIZE: 6,
  MAX_FONT_SIZE: 200,
  DEFAULT_FONT_SIZE: 20,
  DEFAULT_RECT_WIDTH: 100,
  DEFAULT_RECT_HEIGHT: 100,
  DEFAULT_CIRCLE_RADIUS: 50,
  DEFAULT_TEXT_CONTENT: 'Text',
  HEX_COLOR_REGEX: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
  OBJECT_ID_REGEX: /^[0-9a-fA-F]{24}$/,
});
