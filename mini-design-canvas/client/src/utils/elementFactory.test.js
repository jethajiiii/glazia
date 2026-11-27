import { describe, it, expect, beforeEach } from 'vitest';
import { createElement, resetSpawnCounter } from './elementFactory.js';
import { ELEMENT_TYPES } from '../constants/elementTypes.js';
import { ELEMENT_DEFAULTS } from '../constants/defaults.js';

describe('elementFactory - createElement', () => {
  beforeEach(() => {
    resetSpawnCounter();
  });

  it('creates a rectangle with proper defaults and a unique id', () => {
    const rect = createElement(ELEMENT_TYPES.RECT);

    expect(rect).toBeDefined();
    expect(rect.type).toBe(ELEMENT_TYPES.RECT);
    expect(typeof rect.id).toBe('string');
    expect(rect.id.length).toBeGreaterThan(0);
    expect(rect.width).toBe(ELEMENT_DEFAULTS[ELEMENT_TYPES.RECT].width);
    expect(rect.height).toBe(ELEMENT_DEFAULTS[ELEMENT_TYPES.RECT].height);
    expect(rect.fill).toBe(ELEMENT_DEFAULTS[ELEMENT_TYPES.RECT].fill);
    expect(rect.rotation).toBe(0);
    expect(typeof rect.x).toBe('number');
    expect(typeof rect.y).toBe('number');
  });

  it('creates a circle with proper defaults', () => {
    const circle = createElement(ELEMENT_TYPES.CIRCLE);

    expect(circle.type).toBe(ELEMENT_TYPES.CIRCLE);
    expect(circle.radius).toBe(ELEMENT_DEFAULTS[ELEMENT_TYPES.CIRCLE].radius);
    expect(circle.fill).toBe(ELEMENT_DEFAULTS[ELEMENT_TYPES.CIRCLE].fill);
  });

  it('creates a text element with proper defaults', () => {
    const textEl = createElement(ELEMENT_TYPES.TEXT);

    expect(textEl.type).toBe(ELEMENT_TYPES.TEXT);
    expect(textEl.text).toBe(ELEMENT_DEFAULTS[ELEMENT_TYPES.TEXT].text);
    expect(textEl.fontSize).toBe(ELEMENT_DEFAULTS[ELEMENT_TYPES.TEXT].fontSize);
    expect(textEl.fill).toBe(ELEMENT_DEFAULTS[ELEMENT_TYPES.TEXT].fill);
  });

  it('generates distinct unique IDs for sequential elements', () => {
    const el1 = createElement(ELEMENT_TYPES.RECT);
    const el2 = createElement(ELEMENT_TYPES.RECT);

    expect(el1.id).not.toBe(el2.id);
  });

  it('staggers position of sequential elements so they do not stack exactly', () => {
    const el1 = createElement(ELEMENT_TYPES.RECT);
    const el2 = createElement(ELEMENT_TYPES.RECT);

    expect(el1.x).not.toBe(el2.x);
    expect(el1.y).not.toBe(el2.y);
    expect(el2.x - el1.x).toBe(24);
  });

  it('applies custom property overrides while protecting type', () => {
    const customRect = createElement(ELEMENT_TYPES.RECT, {
      x: 350,
      y: 450,
      width: 500,
      fill: '#ff0000',
      rotation: 45,
    });

    expect(customRect.x).toBe(350);
    expect(customRect.y).toBe(450);
    expect(customRect.width).toBe(500);
    expect(customRect.fill).toBe('#ff0000');
    expect(customRect.rotation).toBe(45);
    expect(customRect.type).toBe(ELEMENT_TYPES.RECT);
  });

  it('throws a descriptive error when an unsupported element type is passed', () => {
    expect(() => createElement('triangle')).toThrowError(/Unsupported element type: "triangle"/);
  });
});
