import { describe, it, expect } from 'vitest';
import { getKonvaProps, getTransformPatch } from './shapeAdapters.js';
import { ELEMENT_TYPES } from '../../../constants/elementTypes.js';

describe('shapeAdapters', () => {
  describe('getKonvaProps', () => {
    it('adapts rectangle element props to Konva Rect props', () => {
      const rectElement = {
        id: 'rect-1',
        type: ELEMENT_TYPES.RECT,
        x: 100,
        y: 150,
        width: 200,
        height: 120,
        fill: '#3b82f6',
        rotation: 30,
      };

      const props = getKonvaProps(rectElement);

      expect(props.id).toBe('rect-1');
      expect(props.x).toBe(100);
      expect(props.y).toBe(150);
      expect(props.width).toBe(200);
      expect(props.height).toBe(120);
      expect(props.fill).toBe('#3b82f6');
      expect(props.rotation).toBe(30);
      expect(props.draggable).toBe(true);
    });

    it('adapts circle element props to Konva Circle props with center origin', () => {
      const circleElement = {
        id: 'circle-1',
        type: ELEMENT_TYPES.CIRCLE,
        x: 250,
        y: 300,
        radius: 60,
        fill: '#10b981',
      };

      const props = getKonvaProps(circleElement);

      expect(props.id).toBe('circle-1');
      expect(props.x).toBe(250); // Represents circle center
      expect(props.y).toBe(300); // Represents circle center
      expect(props.radius).toBe(60);
      expect(props.fill).toBe('#10b981');
      expect(props.draggable).toBe(true);
    });

    it('adapts text element props to Konva Text props', () => {
      const textElement = {
        id: 'text-1',
        type: ELEMENT_TYPES.TEXT,
        x: 50,
        y: 50,
        text: 'Custom Label',
        fontSize: 24,
        fill: '#000000',
      };

      const props = getKonvaProps(textElement);

      expect(props.id).toBe('text-1');
      expect(props.text).toBe('Custom Label');
      expect(props.fontSize).toBe(24);
      expect(props.fill).toBe('#000000');
    });
  });

  describe('getTransformPatch', () => {
    it('computes scaled width/height for rectangle and resets scale to 1', () => {
      let resetScaleX = null;
      let resetScaleY = null;

      const mockNode = {
        x: () => 120,
        y: () => 140,
        rotation: () => 15,
        scaleX: (val) => {
          if (val !== undefined) resetScaleX = val;
          return 1.5;
        },
        scaleY: (val) => {
          if (val !== undefined) resetScaleY = val;
          return 2.0;
        },
        width: () => 100,
        height: () => 50,
      };

      const patch = getTransformPatch({ type: ELEMENT_TYPES.RECT }, mockNode);

      expect(resetScaleX).toBe(1);
      expect(resetScaleY).toBe(1);
      expect(patch.x).toBe(120);
      expect(patch.y).toBe(140);
      expect(patch.rotation).toBe(15);
      expect(patch.width).toBe(150); // 100 * 1.5
      expect(patch.height).toBe(100); // 50 * 2.0
    });

    it('computes scaled radius for circle and resets scale to 1', () => {
      let resetScale = null;

      const mockNode = {
        x: () => 200,
        y: () => 200,
        rotation: () => 0,
        scaleX: (val) => {
          if (val !== undefined) resetScale = val;
          return 1.4;
        },
        scaleY: () => 1.4,
        radius: () => 50,
      };

      const patch = getTransformPatch({ type: ELEMENT_TYPES.CIRCLE }, mockNode);

      expect(resetScale).toBe(1);
      expect(patch.radius).toBe(70); // 50 * 1.4
    });

    it('computes scaled font size for text and resets scale to 1', () => {
      let resetScale = null;

      const mockNode = {
        x: () => 80,
        y: () => 80,
        rotation: () => 0,
        scaleX: () => 1.5,
        scaleY: (val) => {
          if (val !== undefined) resetScale = val;
          return 1.5;
        },
        fontSize: () => 20,
      };

      const patch = getTransformPatch({ type: ELEMENT_TYPES.TEXT }, mockNode);

      expect(resetScale).toBe(1);
      expect(patch.fontSize).toBe(30); // 20 * 1.5
    });
  });
});
