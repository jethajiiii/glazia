import { useCallback, useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { CANVAS_DEFAULTS } from '../../constants/defaults.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { selectElements, selectSelectedId, selectSelectedElement } from '../../store/selectors.js';
import { ElementShape } from './shapes/ElementShape.jsx';
import { SelectionTransformer } from './SelectionTransformer.jsx';
import { GridLayer } from './GridLayer.jsx';

/**
 * Interactive React Konva Canvas Stage.
 * Renders the white drawing artboard, optional grid overlay, shapes,
 * and selection transformer on a canvas workspace.
 *
 * Zoom and pan are controlled externally via scale/stagePos (from useZoomPan).
 * Wheel and mouse drag events are forwarded to the parent's zoom/pan handlers.
 *
 * @param {{
 *   stageRef?: import('react').RefObject<any>,
 *   showGrid?: boolean,
 *   snapToGrid?: boolean,
 *   scale?: number,
 *   stagePos?: { x: number, y: number },
 *   onWheel?: (e: any) => void,
 *   onMouseDown?: (e: any) => void,
 *   onMouseMove?: (e: any) => void,
 *   onMouseUp?: (e: any) => void,
 *   onDropTool?: (toolType: string, coords: { x: number, y: number }) => void,
 * }} props
 */
export function CanvasStage({
  stageRef: externalStageRef,
  showGrid = false,
  snapToGrid = false,
  scale = 1,
  stagePos = { x: 0, y: 0 },
  onWheel,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onDropTool,
}) {
  const internalStageRef = useRef(null);
  const stageRef = externalStageRef || internalStageRef;

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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const toolType = e.dataTransfer.getData('text/plain');
    if (!toolType) return;

    const stage = stageRef.current?.getStage?.() ?? stageRef.current;
    if (!stage) return;

    stage.setPointersPositions(e);
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Convert stage pointer to artboard canvas coordinates taking zoom and pan into account
    const artboardX = Math.round((pointer.x - stagePos.x) / scale);
    const artboardY = Math.round((pointer.y - stagePos.y) / scale);

    if (onDropTool) {
      onDropTool(toolType, { x: artboardX, y: artboardY });
    }
  };

  return (
    <div
      className="canvas-stage-wrapper"
      role="region"
      aria-label="Interactive Artboard Canvas"
      tabIndex={0}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={CANVAS_DEFAULTS.WIDTH}
        height={CANVAS_DEFAULTS.HEIGHT}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        className="canvas-konva-stage"
      >
        {/* Grid overlay layer — rendered below artboard content, non-interactive */}
        <GridLayer visible={showGrid} />

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
              snapToGrid={snapToGrid}
            />
          ))}

          {/* Active selection transformer */}
          <SelectionTransformer
            selectedId={selectedId}
            selectedType={selectedElement?.type}
            selectedElement={selectedElement}
          />
        </Layer>
      </Stage>
    </div>
  );
}
