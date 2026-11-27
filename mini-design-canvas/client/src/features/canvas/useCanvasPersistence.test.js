import { describe, it, expect } from 'vitest';
import { buildPayload } from './useCanvasPersistence.js';
import { CANVAS_DEFAULTS } from '../../constants/defaults.js';

describe('useCanvasPersistence / buildPayload', () => {
  it('falls back to default canvas name when empty string or whitespace is given', () => {
    const p1 = buildPayload('', []);
    expect(p1.name).toBe(CANVAS_DEFAULTS.NAME);

    const p2 = buildPayload('   ', []);
    expect(p2.name).toBe(CANVAS_DEFAULTS.NAME);

    const p3 = buildPayload(null, []);
    expect(p3.name).toBe(CANVAS_DEFAULTS.NAME);
  });

  it('trims whitespace from canvas name', () => {
    const payload = buildPayload('  My Cool Banner   ', []);
    expect(payload.name).toBe('My Cool Banner');
  });

  it('sets standard canvas dimensions from CANVAS_DEFAULTS', () => {
    const payload = buildPayload('Banner', []);
    expect(payload.width).toBe(CANVAS_DEFAULTS.WIDTH);
    expect(payload.height).toBe(CANVAS_DEFAULTS.HEIGHT);
  });

  it('preserves elements array in payload', () => {
    const sampleElements = [
      { id: 'el-1', type: 'rect', x: 10, y: 20, width: 100, height: 100 },
      { id: 'el-2', type: 'circle', x: 50, y: 50, radius: 25 },
    ];
    const payload = buildPayload('My Canvas', sampleElements);
    expect(payload.elements).toEqual(sampleElements);
  });

  it('normalizes non-array elements to empty array', () => {
    const payload = buildPayload('My Canvas', null);
    expect(payload.elements).toEqual([]);
  });
});
