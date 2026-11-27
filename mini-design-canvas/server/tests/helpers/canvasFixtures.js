/**
 * Fixture generators and sample payloads for canvas API tests.
 */

export const sampleRectElement = {
  id: 'rect-1',
  type: 'rect',
  x: 50,
  y: 60,
  width: 120,
  height: 80,
  rotation: 0,
  fill: '#3b82f6',
};

export const sampleCircleElement = {
  id: 'circle-1',
  type: 'circle',
  x: 200,
  y: 150,
  radius: 45,
  rotation: 15,
  fill: '#10b981',
};

export const sampleTextElement = {
  id: 'text-1',
  type: 'text',
  x: 300,
  y: 250,
  text: 'Hello World',
  fontSize: 24,
  rotation: 0,
  fill: '#0f172a',
};

/**
 * Generates a valid canvas creation payload with all 3 element types.
 *
 * @param {object} [overrides]
 * @returns {object}
 */
export function createValidCanvasPayload(overrides = {}) {
  return {
    name: 'Test Design Canvas',
    width: 800,
    height: 600,
    elements: [sampleRectElement, sampleCircleElement, sampleTextElement],
    ...overrides,
  };
}
