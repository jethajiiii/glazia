import { describe, it, expect, vi } from 'vitest';
import { sanitiseFilename, exportStageToPng, EXPORT_PIXEL_RATIO } from './exportStage.js';

describe('exportStage utils', () => {
  describe('sanitiseFilename', () => {
    it('leaves alphanumeric names unchanged', () => {
      expect(sanitiseFilename('MyDesign')).toBe('MyDesign');
    });

    it('replaces spaces with underscores', () => {
      expect(sanitiseFilename('My Canvas Name')).toBe('My_Canvas_Name');
    });

    it('replaces special characters with underscores', () => {
      expect(sanitiseFilename('Design <v2>!')).toBe('Design_v2');
    });

    it('collapses multiple consecutive underscores', () => {
      expect(sanitiseFilename('a  b   c')).toBe('a_b_c');
    });

    it('strips leading and trailing underscores', () => {
      expect(sanitiseFilename('  My Design  ')).toBe('My_Design');
    });

    it('falls back to "untitled" for empty/whitespace input', () => {
      expect(sanitiseFilename('')).toBe('untitled');
      expect(sanitiseFilename('   ')).toBe('untitled');
    });

    it('falls back to "untitled" for null/undefined', () => {
      expect(sanitiseFilename(null)).toBe('untitled');
      expect(sanitiseFilename(undefined)).toBe('untitled');
    });

    it('preserves dots and dashes', () => {
      expect(sanitiseFilename('my-canvas.v2')).toBe('my-canvas.v2');
    });
  });

  describe('exportStageToPng', () => {
    it('exports stage hiding and restoring transformer nodes', () => {
      const mockTransformer = {
        hide: vi.fn(),
        show: vi.fn(),
      };
      const mockStage = {
        find: vi.fn((selector) => (selector === 'Transformer' ? [mockTransformer] : [])),
        batchDraw: vi.fn(),
        toDataURL: vi.fn(() => 'data:image/png;base64,mockdata'),
      };

      const result = exportStageToPng(mockStage, 'Test Canvas');

      expect(mockStage.find).toHaveBeenCalledWith('Transformer');
      expect(mockTransformer.hide).toHaveBeenCalled();
      expect(mockStage.toDataURL).toHaveBeenCalledWith({ pixelRatio: EXPORT_PIXEL_RATIO });
      expect(mockTransformer.show).toHaveBeenCalled();
      expect(mockStage.batchDraw).toHaveBeenCalled();
      expect(result).toBe('data:image/png;base64,mockdata');
    });

    it('restores transformer even if toDataURL throws', () => {
      const mockTransformer = {
        hide: vi.fn(),
        show: vi.fn(),
      };
      const mockStage = {
        find: vi.fn(() => [mockTransformer]),
        batchDraw: vi.fn(),
        toDataURL: vi.fn(() => {
          throw new Error('Canvas tainted');
        }),
      };

      expect(() => exportStageToPng(mockStage, 'Broken Canvas')).toThrow('Canvas tainted');
      expect(mockTransformer.hide).toHaveBeenCalled();
      expect(mockTransformer.show).toHaveBeenCalled();
      expect(mockStage.batchDraw).toHaveBeenCalled();
    });

    it('returns undefined and warns if no stage provided', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = exportStageToPng(null, 'No Stage');
      expect(result).toBeUndefined();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('extracts stage from a stage ref object with getStage()', () => {
      const mockStage = {
        find: vi.fn(() => []),
        batchDraw: vi.fn(),
        toDataURL: vi.fn(() => 'data:image/png;base64,fromref'),
      };
      const mockRef = {
        getStage: () => mockStage,
      };

      const result = exportStageToPng(mockRef, 'Ref Canvas');
      expect(result).toBe('data:image/png;base64,fromref');
    });
  });
});
