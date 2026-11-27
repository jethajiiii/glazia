import { ELEMENT_TYPES } from '../../constants/elementTypes.js';
import { ELEMENT_BOUNDS } from '../../constants/defaults.js';

export const PROPERTY_SECTIONS = Object.freeze({
  COORDINATES: 'Coordinates',
  DIMENSIONS: 'Dimensions',
  TYPOGRAPHY: 'Typography',
  APPEARANCE: 'Appearance',
});

/**
 * Declarative configuration mapping editable properties to input types,
 * numerical boundaries, and applicable element types.
 *
 * Adding or modifying an editable property in the inspector requires ONLY
 * adding or changing an entry in this array.
 */
export const PROPERTY_FIELDS_CONFIG = Object.freeze([
  // Coordinates
  {
    key: 'x',
    label: 'X',
    input: 'number',
    unit: 'px',
    section: PROPERTY_SECTIONS.COORDINATES,
    appliesTo: [ELEMENT_TYPES.RECT, ELEMENT_TYPES.CIRCLE, ELEMENT_TYPES.TEXT],
    step: 1,
    round: true,
  },
  {
    key: 'y',
    label: 'Y',
    input: 'number',
    unit: 'px',
    section: PROPERTY_SECTIONS.COORDINATES,
    appliesTo: [ELEMENT_TYPES.RECT, ELEMENT_TYPES.CIRCLE, ELEMENT_TYPES.TEXT],
    step: 1,
    round: true,
  },

  // Dimensions
  {
    key: 'width',
    label: 'Width',
    input: 'number',
    unit: 'px',
    min: ELEMENT_BOUNDS.MIN_DIMENSION,
    max: ELEMENT_BOUNDS.MAX_DIMENSION,
    section: PROPERTY_SECTIONS.DIMENSIONS,
    appliesTo: [ELEMENT_TYPES.RECT],
    step: 1,
    round: true,
  },
  {
    key: 'height',
    label: 'Height',
    input: 'number',
    unit: 'px',
    min: ELEMENT_BOUNDS.MIN_DIMENSION,
    max: ELEMENT_BOUNDS.MAX_DIMENSION,
    section: PROPERTY_SECTIONS.DIMENSIONS,
    appliesTo: [ELEMENT_TYPES.RECT],
    step: 1,
    round: true,
  },
  {
    key: 'radius',
    label: 'Radius',
    input: 'number',
    unit: 'px',
    min: ELEMENT_BOUNDS.MIN_RADIUS,
    max: ELEMENT_BOUNDS.MAX_RADIUS,
    section: PROPERTY_SECTIONS.DIMENSIONS,
    appliesTo: [ELEMENT_TYPES.CIRCLE],
    step: 1,
    round: true,
  },

  // Typography
  {
    key: 'text',
    label: 'Text Content',
    input: 'text',
    section: PROPERTY_SECTIONS.TYPOGRAPHY,
    appliesTo: [ELEMENT_TYPES.TEXT],
    placeholder: 'Enter text content...',
  },
  {
    key: 'fontSize',
    label: 'Font Size',
    input: 'number',
    unit: 'px',
    min: ELEMENT_BOUNDS.MIN_FONT_SIZE,
    max: ELEMENT_BOUNDS.MAX_FONT_SIZE,
    section: PROPERTY_SECTIONS.TYPOGRAPHY,
    appliesTo: [ELEMENT_TYPES.TEXT],
    step: 1,
    round: true,
  },

  // Appearance
  {
    key: 'rotation',
    label: 'Rotation',
    input: 'number',
    unit: '°',
    min: ELEMENT_BOUNDS.MIN_ROTATION,
    max: ELEMENT_BOUNDS.MAX_ROTATION,
    section: PROPERTY_SECTIONS.APPEARANCE,
    appliesTo: [ELEMENT_TYPES.RECT, ELEMENT_TYPES.CIRCLE, ELEMENT_TYPES.TEXT],
    step: 1,
    round: true,
  },
  {
    key: 'fill',
    label: 'Fill Color',
    input: 'color',
    section: PROPERTY_SECTIONS.APPEARANCE,
    appliesTo: [ELEMENT_TYPES.RECT, ELEMENT_TYPES.CIRCLE, ELEMENT_TYPES.TEXT],
  },
]);
