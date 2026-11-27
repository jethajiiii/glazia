import React from 'react';
import { Rect, Circle, Text } from 'react-konva';
import { ELEMENT_TYPES } from '../../../constants/elementTypes.js';
import { getKonvaProps, getTransformPatch } from './shapeAdapters.js';

/**
 * Mapping between domain element types and Konva shape components.
 * Config-driven to avoid copy-pasting three near-identical shape components.
 */
const KONVA_SHAPE_COMPONENTS = {
  [ELEMENT_TYPES.RECT]: Rect,
  [ELEMENT_TYPES.CIRCLE]: Circle,
  [ELEMENT_TYPES.TEXT]: Text,
};

/**
 * Single generic shape component rendering Rect, Circle, or Text.
 * Wrapped in React.memo with stable callbacks to eliminate unnecessary re-renders.
 */
function ElementShapeComponent({ element, onSelect, onUpdate }) {
  const KonvaComponent = KONVA_SHAPE_COMPONENTS[element.type];

  if (!KonvaComponent) {
    console.warn(`Unsupported Konva element type: ${element.type}`);
    return null;
  }

  const konvaProps = getKonvaProps(element);

  const handleClick = (e) => {
    e.cancelBubble = true; // Stop event bubbling to canvas background
    onSelect(element.id);
  };

  const handleDragEnd = (e) => {
    const x = Math.round(e.target.x());
    const y = Math.round(e.target.y());
    onUpdate(element.id, { x, y });
  };

  const handleTransformEnd = (e) => {
    const node = e.target;
    const patch = getTransformPatch(element, node);
    onUpdate(element.id, patch);
  };

  return (
    <KonvaComponent
      {...konvaProps}
      onClick={handleClick}
      onTap={handleClick}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    />
  );
}

/**
 * Memoized shape renderer: only re-renders when the element's own properties change.
 */
export const ElementShape = React.memo(ElementShapeComponent);
