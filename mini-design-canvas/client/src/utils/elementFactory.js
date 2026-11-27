import { v4 as uuidv4 } from 'uuid';
import { ELEMENT_TYPES } from '../constants/elementTypes.js';
import { ELEMENT_DEFAULTS } from '../constants/defaults.js';

let spawnCounter = 0;

/**
 * Resets spawn counter offset (useful for testing and deterministic resets).
 */
export function resetSpawnCounter() {
  spawnCounter = 0;
}

/**
 * Factory creating fully-populated, validated element objects.
 * Staggers default coordinates so newly added elements don't overlap completely.
 *
 * @param {'rect' | 'circle' | 'text'} type - Element shape type
 * @param {object} [overrides={}] - Optional property overrides
 * @returns {object} Populated element object
 */
export function createElement(type, overrides = {}) {
  const defaultProps = ELEMENT_DEFAULTS[type];

  if (!defaultProps) {
    throw new Error(
      `Unsupported element type: "${type}". Allowed types: ${Object.values(ELEMENT_TYPES).join(', ')}`,
    );
  }

  // Slight positional offset so sequential shapes don't perfectly stack
  const staggerOffset = (spawnCounter++ % 10) * 24;
  const defaultX = 100 + staggerOffset;
  const defaultY = 100 + staggerOffset;

  const baseElement = {
    id: uuidv4(),
    type,
    x: defaultX,
    y: defaultY,
    rotation: 0,
    ...defaultProps,
  };

  return {
    ...baseElement,
    ...overrides,
    id: overrides.id || baseElement.id,
    type, // Ensure type cannot be arbitrarily overridden
  };
}
