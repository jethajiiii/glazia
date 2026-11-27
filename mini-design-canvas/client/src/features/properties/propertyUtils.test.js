import { describe, it, expect } from 'vitest';
import {
  clampNumber,
  parseNumericInput,
  isValidHexColor,
  sanitizePropertyValue,
} from './propertyUtils.js';

describe('propertyUtils', () => {
  describe('clampNumber', () => {
    it('returns value within bounds unchanged', () => {
      expect(clampNumber(50, 10, 100)).toBe(50);
    });

    it('clamps values below minimum to min', () => {
      expect(clampNumber(-5, 0, 100)).toBe(0);
      expect(clampNumber(3, 10, 50)).toBe(10);
    });

    it('clamps values above maximum to max', () => {
      expect(clampNumber(150, 0, 100)).toBe(100);
      expect(clampNumber(700, -360, 360)).toBe(360);
    });

    it('handles undefined bounds gracefully', () => {
      expect(clampNumber(-25, undefined, 100)).toBe(-25);
      expect(clampNumber(500, 10, undefined)).toBe(500);
      expect(clampNumber(42, undefined, undefined)).toBe(42);
    });
  });

  describe('parseNumericInput', () => {
    it('parses valid numeric strings and rounds by default', () => {
      expect(parseNumericInput('42.7')).toBe(43);
      expect(parseNumericInput('100')).toBe(100);
    });

    it('respects round: false option', () => {
      expect(parseNumericInput('42.75', 0, { round: false })).toBe(42.75);
    });

    it('returns clamped fallback on empty string, null, or undefined', () => {
      expect(parseNumericInput('', 25)).toBe(25);
      expect(parseNumericInput(null, 50)).toBe(50);
      expect(parseNumericInput(undefined, 75)).toBe(75);
      expect(parseNumericInput('', 0, { min: 10, max: 100 })).toBe(10);
    });

    it('returns clamped fallback on NaN or malformed strings', () => {
      expect(parseNumericInput('abc', 10)).toBe(10);
      expect(parseNumericInput('NaN', 42)).toBe(42);
    });

    it('clamps parsed number within specified min and max bounds', () => {
      expect(parseNumericInput('5', 50, { min: 10, max: 100 })).toBe(10);
      expect(parseNumericInput('250', 50, { min: 10, max: 100 })).toBe(100);
    });
  });

  describe('isValidHexColor', () => {
    it('accepts valid 3, 6, and 8 character hex codes', () => {
      expect(isValidHexColor('#fff')).toBe(true);
      expect(isValidHexColor('#3b82f6')).toBe(true);
      expect(isValidHexColor('#10B981')).toBe(true);
      expect(isValidHexColor('#ffffff80')).toBe(true);
    });

    it('rejects invalid hex codes or named color strings', () => {
      expect(isValidHexColor('blue')).toBe(false);
      expect(isValidHexColor('#12')).toBe(false);
      expect(isValidHexColor('123456')).toBe(false); // missing #
      expect(isValidHexColor(null)).toBe(false);
      expect(isValidHexColor(undefined)).toBe(false);
    });
  });

  describe('sanitizePropertyValue', () => {
    it('sanitizes number properties according to field limits', () => {
      const widthConfig = { key: 'width', input: 'number', min: 10, max: 500 };

      expect(sanitizePropertyValue(widthConfig, '150', 50)).toBe(150);
      expect(sanitizePropertyValue(widthConfig, '2', 50)).toBe(10); // Clamped to min
      expect(sanitizePropertyValue(widthConfig, '999', 50)).toBe(500); // Clamped to max
      expect(sanitizePropertyValue(widthConfig, '', 75)).toBe(75); // Fallback to current
    });

    it('sanitizes color properties with hex validation', () => {
      const colorConfig = { key: 'fill', input: 'color' };

      expect(sanitizePropertyValue(colorConfig, '#ef4444', '#000000')).toBe('#ef4444');
      expect(sanitizePropertyValue(colorConfig, 'invalid-color', '#3b82f6')).toBe('#3b82f6');
    });

    it('sanitizes text properties into strings', () => {
      const textConfig = { key: 'text', input: 'text' };

      expect(sanitizePropertyValue(textConfig, 'New Heading', 'Old')).toBe('New Heading');
      expect(sanitizePropertyValue(textConfig, 12345, 'Old')).toBe('12345');
      expect(sanitizePropertyValue(textConfig, null, 'Old')).toBe('');
    });
  });
});
