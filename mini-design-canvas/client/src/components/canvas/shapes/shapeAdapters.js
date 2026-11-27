import { ELEMENT_TYPES } from '../../../constants/elementTypes.js';
import { ELEMENT_BOUNDS } from '../../../constants/defaults.js';

/**
 * ============================================================================
 * Coordinate Origin Difference Documentation:
 * - Rect Origin: (x, y) anchors at the top-left corner of the rectangle.
 * - Circle Origin: In Konva, (x, y) anchors at the geometric center of the circle.
 *   When positioning or dragging a Circle, (x, y) is its center point.
 * - Text Origin: (x, y) anchors at the top-left corner of the text bounding box.
 * ============================================================================
 */

/**
 * Adapter converting store element properties into Konva-compatible props.
 *
 * @param {object} element - Store element data
 * @returns {object} Konva node props
 */
export function getKonvaProps(element) {
  const baseProps = {
    id: element.id,
    x: element.x,
    y: element.y,
    rotation: element.rotation || 0,
    fill: element.fill,
    draggable: true,
  };

  switch (element.type) {
    case ELEMENT_TYPES.RECT:
      return {
        ...baseProps,
        width: Math.max(ELEMENT_BOUNDS.MIN_DIMENSION, element.width || 100),
        height: Math.max(ELEMENT_BOUNDS.MIN_DIMENSION, element.height || 100),
      };

    case ELEMENT_TYPES.CIRCLE:
      return {
        ...baseProps,
        // Circle origin is its center (x, y)
        radius: Math.max(ELEMENT_BOUNDS.MIN_RADIUS, element.radius || 40),
      };

    case ELEMENT_TYPES.TEXT:
      return {
        ...baseProps,
        text: element.text || '',
        fontSize: Math.max(
          ELEMENT_BOUNDS.MIN_FONT_SIZE,
          Math.min(ELEMENT_BOUNDS.MAX_FONT_SIZE, element.fontSize || 20),
        ),
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      };

    default:
      return baseProps;
  }
}

/**
 * Calculates updated shape geometry and normalizes scales back to 1.
 *
 * @param {object} element - Target store element
 * @param {import('konva/lib/Node').Node} node - Konva transformed node
 * @returns {object} Property patch for the store
 */
export function getTransformPatch(element, node) {
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();

  // Reset node scales immediately so subsequent renders remain unscaled
  node.scaleX(1);
  node.scaleY(1);

  const basePatch = {
    x: Math.round(node.x()),
    y: Math.round(node.y()),
    rotation: Math.round(node.rotation()),
  };

  if (element.type === ELEMENT_TYPES.RECT) {
    const newWidth = Math.max(
      ELEMENT_BOUNDS.MIN_DIMENSION,
      Math.round(node.width() * Math.abs(scaleX)),
    );
    const newHeight = Math.max(
      ELEMENT_BOUNDS.MIN_DIMENSION,
      Math.round(node.height() * Math.abs(scaleY)),
    );

    return {
      ...basePatch,
      width: newWidth,
      height: newHeight,
    };
  }

  if (element.type === ELEMENT_TYPES.CIRCLE) {
    // Circle scales uniformly using max scale factor
    const scale = Math.max(Math.abs(scaleX), Math.abs(scaleY));
    const newRadius = Math.max(ELEMENT_BOUNDS.MIN_RADIUS, Math.round(node.radius() * scale));

    return {
      ...basePatch,
      radius: newRadius,
    };
  }

  if (element.type === ELEMENT_TYPES.TEXT) {
    const scale = Math.max(Math.abs(scaleX), Math.abs(scaleY));
    const newFontSize = Math.max(
      ELEMENT_BOUNDS.MIN_FONT_SIZE,
      Math.min(ELEMENT_BOUNDS.MAX_FONT_SIZE, Math.round((node.fontSize() || 20) * scale)),
    );

    return {
      ...basePatch,
      fontSize: newFontSize,
    };
  }

  return basePatch;
}
