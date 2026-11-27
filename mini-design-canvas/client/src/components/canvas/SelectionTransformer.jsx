import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import { ELEMENT_TYPES } from '../../constants/elementTypes.js';

/**
 * Selection Transformer attaching bounding box and resize handles to the selected Konva shape.
 *
 * @param {{
 *   selectedId: string | null,
 *   selectedType?: string | null
 * }} props
 */
export function SelectionTransformer({ selectedId, selectedType }) {
  const transformerRef = useRef(null);

  useEffect(() => {
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
  }, [selectedId]);

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
      anchorSize={8}
      anchorCornerRadius={2}
      anchorStroke="#2563eb"
      anchorFill="#ffffff"
      anchorStrokeWidth={1.5}
      borderStroke="#2563eb"
      borderStrokeWidth={1.5}
      borderDash={[4, 4]}
      rotateAnchorOffset={24}
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
