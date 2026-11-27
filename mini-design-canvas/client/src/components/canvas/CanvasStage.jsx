import { useCallback } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { CANVAS_DEFAULTS } from '../../constants/defaults.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { selectElements, selectSelectedId, selectSelectedElement } from '../../store/selectors.js';
import { ElementShape } from './shapes/ElementShape.jsx';
import { SelectionTransformer } from './SelectionTransformer.jsx';

/**
 * Interactive React Konva Canvas Stage.
 * Renders the white drawing artboard, shapes, and selection transformer on a canvas workspace.
 */
export function CanvasStage() {
  const elements = useEditorStore(selectElements);
  const selectedId = useEditorStore(selectSelectedId);
  const selectedElement = useEditorStore(selectSelectedElement);

  const selectElement = useEditorStore((state) => state.selectElement);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const updateElement = useEditorStore((state) => state.updateElement);

  // Deselect when clicking directly on the artboard background or stage empty space
  const handleStageClick = useCallback(
    (e) => {
      const clickedOnEmpty =
        e.target === e.target.getStage() || e.target.id() === 'canvas-artboard-bg';

      if (clickedOnEmpty) {
        clearSelection();
      }
    },
    [clearSelection],
  );

  return (
    <div className="canvas-stage-wrapper">
      <Stage
        width={CANVAS_DEFAULTS.WIDTH}
        height={CANVAS_DEFAULTS.HEIGHT}
        onClick={handleStageClick}
        onTap={handleStageClick}
        className="canvas-konva-stage"
      >
        <Layer>
          {/* White artboard background */}
          <Rect
            id="canvas-artboard-bg"
            x={0}
            y={0}
            width={CANVAS_DEFAULTS.WIDTH}
            height={CANVAS_DEFAULTS.HEIGHT}
            fill="#ffffff"
            listening={true}
          />

          {/* Graphical elements */}
          {elements.map((element) => (
            <ElementShape
              key={element.id}
              element={element}
              onSelect={selectElement}
              onUpdate={updateElement}
            />
          ))}

          {/* Active selection transformer */}
          <SelectionTransformer selectedId={selectedId} selectedType={selectedElement?.type} />
        </Layer>
      </Stage>
    </div>
  );
}
