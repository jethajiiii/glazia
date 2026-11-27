import { useLayoutEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import { ELEMENT_TYPES } from '../../constants/elementTypes.js';

/**
 * Selection Transformer attaching bounding box and resize handles to the selected Konva shape.
 *
 * Uses useLayoutEffect (not useEffect) so the transformer node attachment happens
 * synchronously before the browser paints — this prevents one-frame flicker where
 * handles appear detached and prevents Konva's internal drag state from being reset
 * mid-gesture by an async re-attachment.
 *
 * @param {{
 *   selectedId: string | null,
 *   selectedType?: string | null,
 *   selectedElement?: object | null
 * }} props
 */
export function SelectionTransformer({ selectedId, selectedType, selectedElement }) {
  const transformerRef = useRef(null);

  useLayoutEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;

    const stage = tr.getStage();
    if (!stage || !selectedId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    const selectedNode = stage.findOne(`#${selectedId}`);

    if (selectedNode) {
      tr.nodes([selectedNode]);
    } else {
      tr.nodes([]);
    }

    tr.getLayer()?.batchDraw();
    // Re-run when the selected element's data changes so handles stay in sync
    // after property panel edits (width, height, radius, rotation, x, y).
  }, [selectedId, selectedElement]);

  // Circles enforce keepRatio with diagonal anchors; text uses uniform scaling; rect uses all 8
  const isCircle = selectedType === ELEMENT_TYPES.CIRCLE;
  const isText = selectedType === ELEMENT_TYPES.TEXT;

  const enabledAnchors =
    isCircle || isText
      ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
      : [
          'top-left',
          'top-center',
          'top-right',
          'middle-right',
          'bottom-right',
          'bottom-center',
          'bottom-left',
          'middle-left',
        ];

  return (
    <Transformer
      ref={transformerRef}
      keepRatio={isCircle || isText}
      enabledAnchors={enabledAnchors}
      anchorSize={10}
      anchorCornerRadius={2}
      hitStrokeWidth={12}
      anchorStroke="#2563eb"
      anchorFill="#ffffff"
      anchorStrokeWidth={1.5}
      borderStroke="#2563eb"
      borderStrokeWidth={1.5}
      borderDash={[4, 4]}
      rotateAnchorOffset={26}
      boundBoxFunc={(oldBox, newBox) => {
        // Enforce minimum box dimensions to prevent collapsing or inversion
        if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
          return oldBox;
        }
        return newBox;
      }}
    />
  );
}
