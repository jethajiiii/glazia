import { ELEMENT_TYPES, ELEMENT_LABELS } from '../../constants/elementTypes.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { selectSelectedId } from '../../store/selectors.js';

/**
 * Declarative configuration for layer z-order actions.
 * All actions require a selected element to be active.
 */
const LAYER_TOOL_CONFIG = [
  {
    id: 'bringToFront',
    label: 'Bring to Front',
    shortcut: 'Shift+]',
    icon: '⤒',
    materialIcon: 'flip_to_front',
    action: 'bringToFront',
  },
  {
    id: 'bringForward',
    label: 'Bring Forward',
    shortcut: ']',
    icon: '↑',
    materialIcon: 'arrow_upward',
    action: 'bringForward',
  },
  {
    id: 'sendBackward',
    label: 'Send Backward',
    shortcut: '[',
    icon: '↓',
    materialIcon: 'arrow_downward',
    action: 'sendBackward',
  },
  {
    id: 'sendToBack',
    label: 'Send to Back',
    shortcut: 'Shift+[',
    icon: '⤓',
    materialIcon: 'flip_to_back',
    action: 'sendToBack',
  },
];

/**
 * Declarative configuration array of drawing and interaction tools.
 */
const TOOL_CONFIG = [
  {
    id: 'select',
    label: 'Select & Move',
    shortcut: 'V',
    icon: '↖',
    materialIcon: 'near_me',
    type: null,
  },
  {
    id: ELEMENT_TYPES.RECT,
    label: `Add ${ELEMENT_LABELS[ELEMENT_TYPES.RECT]}`,
    shortcut: 'R',
    icon: '▭',
    materialIcon: 'crop_square',
    type: ELEMENT_TYPES.RECT,
  },
  {
    id: ELEMENT_TYPES.CIRCLE,
    label: `Add ${ELEMENT_LABELS[ELEMENT_TYPES.CIRCLE]}`,
    shortcut: 'C',
    icon: '○',
    materialIcon: 'radio_button_unchecked',
    type: ELEMENT_TYPES.CIRCLE,
  },
  {
    id: ELEMENT_TYPES.TEXT,
    label: `Add ${ELEMENT_LABELS[ELEMENT_TYPES.TEXT]}`,
    shortcut: 'T',
    icon: 'T',
    materialIcon: 'title',
    type: ELEMENT_TYPES.TEXT,
  },
  {
    id: 'note',
    label: 'Add Glazia Note',
    shortcut: 'S',
    icon: '📝',
    materialIcon: 'sticky_note_2',
    type: 'note',
  },
];

/**
 * Floating Dock Toolbar component for canvas tool selection, element deletion,
 * and layer z-order management.
 *
 * @param {{
 *   activeTool: string,
 *   onSelectTool: (toolId: string) => void,
 *   isGridEnabled?: boolean,
 *   onToggleGrid?: () => void,
 *   onExportPng?: () => void
 * }} props
 */
export function Toolbar({
  activeTool,
  onSelectTool,
  isGridEnabled = false,
  onToggleGrid,
  onExportPng,
}) {
  const selectedId = useEditorStore(selectSelectedId);
  const deleteElement = useEditorStore((state) => state.deleteElement);
  const bringToFront = useEditorStore((state) => state.bringToFront);
  const bringForward = useEditorStore((state) => state.bringForward);
  const sendBackward = useEditorStore((state) => state.sendBackward);
  const sendToBack = useEditorStore((state) => state.sendToBack);

  /** Maps action string from LAYER_TOOL_CONFIG to the corresponding store action. */
  const layerActions = { bringToFront, bringForward, sendBackward, sendToBack };

  return (
    <aside className="toolbar-sidebar" aria-label="Canvas Drawing Tools">
      <nav className="toolbar-dock" aria-label="Tool Selection">
        {TOOL_CONFIG.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={`toolbar-btn ${activeTool === tool.id ? 'toolbar-btn--active' : ''}`}
            aria-label={tool.label}
            title={`${tool.label} (${tool.shortcut})`}
            onClick={() => onSelectTool(tool.id)}
          >
            <span className="material-symbols-outlined text-[19px]">{tool.materialIcon}</span>
          </button>
        ))}

        <div className="toolbar-divider" />

        <button
          type="button"
          className="toolbar-btn toolbar-btn--delete"
          aria-label="Delete selected element"
          title="Delete Selected Element (Delete/Backspace)"
          disabled={!selectedId}
          onClick={() => deleteElement(selectedId)}
        >
          <span className="material-symbols-outlined text-[19px]">delete</span>
        </button>

        <div className="toolbar-divider" />

        {LAYER_TOOL_CONFIG.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className="toolbar-btn"
            aria-label={tool.label}
            title={`${tool.label} (${tool.shortcut})`}
            disabled={!selectedId}
            onClick={() => layerActions[tool.action]()}
          >
            <span className="material-symbols-outlined text-[19px]">{tool.materialIcon}</span>
          </button>
        ))}

        {(onToggleGrid || onExportPng) && <div className="toolbar-divider" />}

        {onToggleGrid && (
          <button
            type="button"
            className={`toolbar-btn ${isGridEnabled ? 'toolbar-btn--active' : ''}`}
            aria-label="Toggle grid and snapping"
            title={`Toggle Grid & Snapping (${isGridEnabled ? 'On' : 'Off'})`}
            onClick={onToggleGrid}
          >
            <span className="material-symbols-outlined text-[19px]">grid_4x4</span>
          </button>
        )}

        {onExportPng && (
          <button
            type="button"
            className="toolbar-btn"
            aria-label="Export canvas as PNG image"
            title="Export Canvas as PNG"
            onClick={onExportPng}
          >
            <span className="material-symbols-outlined text-[19px]">download</span>
          </button>
        )}
      </nav>
    </aside>
  );
}
