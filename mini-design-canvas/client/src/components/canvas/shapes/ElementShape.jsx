import React from 'react';
import { Rect, Circle, Text } from 'react-konva';
import { ELEMENT_TYPES } from '../../../constants/elementTypes.js';
import { GRID_CONFIG } from '../../../constants/defaults.js';
import { snapToGrid as snapCoordinate } from '../../../utils/gridUtils.js';
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
 *
 * @param {{ element: object, onSelect: Function, onUpdate: Function, snapToGrid?: boolean }} props
 */
function ElementShapeComponent({ element, onSelect, onUpdate, snapToGrid = false }) {
  const KonvaComponent = KONVA_SHAPE_COMPONENTS[element.type];

  if (!KonvaComponent) {
    console.warn(`Unsupported Konva element type: ${element.type}`);
    return null;
  }

  const konvaProps = getKonvaProps(element);

  const handleSelect = (e) => {
    e.cancelBubble = true; // Stop event bubbling to canvas background
    onSelect(element.id);
  };

  const handleDblClick = (e) => {
    e.cancelBubble = true;
    onSelect(element.id);

    // If text element, focus the text content input in the properties panel
    if (element.type === ELEMENT_TYPES.TEXT) {
      setTimeout(() => {
        const input = document.getElementById('prop-text');
        if (input) {
          input.focus();
          input.select?.();
        }
      }, 50);
    }
  };

  const handleDragStart = (e) => {
    e.cancelBubble = true;
    onSelect(element.id);
  };

  const handleDragEnd = (e) => {
    let x = Math.round(e.target.x());
    let y = Math.round(e.target.y());

    if (snapToGrid) {
      x = snapCoordinate(x, GRID_CONFIG.SIZE);
      y = snapCoordinate(y, GRID_CONFIG.SIZE);
      // Reposition the Konva node immediately so it snaps visually before the store update
      e.target.x(x);
      e.target.y(y);
    }

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
      onClick={handleSelect}
      onTap={handleSelect}
      onMouseDown={handleSelect}
      onTouchStart={handleSelect}
      onDragStart={handleDragStart}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    />
  );
}

/**
 * Memoized shape renderer: only re-renders when the element's own properties change.
 */
export const ElementShape = React.memo(ElementShapeComponent);
