/**
 * Supported canvas element types.
 */
export const ELEMENT_TYPES = Object.freeze({
  RECT: 'rect',
  CIRCLE: 'circle',
  TEXT: 'text',
});

/**
 * Human-readable labels for element types.
 */
export const ELEMENT_LABELS = Object.freeze({
  [ELEMENT_TYPES.RECT]: 'Rectangle',
  [ELEMENT_TYPES.CIRCLE]: 'Circle',
  [ELEMENT_TYPES.TEXT]: 'Text',
});
