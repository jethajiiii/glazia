import { ELEMENT_TYPES, ELEMENT_LABELS } from '../../constants/elementTypes.js';
import { IconButton } from '../ui/IconButton.jsx';
import { useEditorStore } from '../../store/useEditorStore.js';
import { selectSelectedId } from '../../store/selectors.js';

/**
 * Declarative config for layer z-order actions.
 * All actions require a selected element to be active.
 */
const LAYER_TOOL_CONFIG = [
  {
    id: 'bringToFront',
    label: 'Bring to Front',
    shortcut: 'Shift+]',
    icon: '⤒',
    action: 'bringToFront',
  },
  {
    id: 'bringForward',
    label: 'Bring Forward',
    shortcut: ']',
    icon: '↑',
    action: 'bringForward',
  },
  {
    id: 'sendBackward',
    label: 'Send Backward',
    shortcut: '[',
    icon: '↓',
    action: 'sendBackward',
  },
  {
    id: 'sendToBack',
    label: 'Send to Back',
    shortcut: 'Shift+[',
    icon: '⤓',
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
    icon: '⬚',
    type: null,
  },
  {
    id: ELEMENT_TYPES.RECT,
    label: `Add ${ELEMENT_LABELS[ELEMENT_TYPES.RECT]}`,
    shortcut: 'R',
    icon: '▭',
    type: ELEMENT_TYPES.RECT,
  },
  {
    id: ELEMENT_TYPES.CIRCLE,
    label: `Add ${ELEMENT_LABELS[ELEMENT_TYPES.CIRCLE]}`,
    shortcut: 'C',
    icon: '○',
    type: ELEMENT_TYPES.CIRCLE,
  },
  {
    id: ELEMENT_TYPES.TEXT,
    label: `Add ${ELEMENT_LABELS[ELEMENT_TYPES.TEXT]}`,
    shortcut: 'T',
    icon: 'T',
    type: ELEMENT_TYPES.TEXT,
  },
];

/**
 * Config-driven Toolbar component for canvas tool selection, element deletion,
 * and layer z-order management.
 *
 * @param {{
 *   activeTool: string,
 *   onSelectTool: (toolId: string) => void
 * }} props
 */
export function Toolbar({ activeTool, onSelectTool }) {
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
      {TOOL_CONFIG.map((tool) => (
        <IconButton
          key={tool.id}
          aria-label={tool.label}
          title={`${tool.label} (${tool.shortcut})`}
          isActive={activeTool === tool.id}
          onClick={() => onSelectTool(tool.id)}
        >
          {tool.icon}
        </IconButton>
      ))}

      <div className="toolbar-divider" />

      <IconButton
        aria-label="Delete selected element"
        title="Delete Selected Element (Delete/Backspace)"
        variant="ghost"
        disabled={!selectedId}
        onClick={() => deleteElement(selectedId)}
      >
        ✕
      </IconButton>

      <div className="toolbar-divider" />

      {LAYER_TOOL_CONFIG.map((tool) => (
        <IconButton
          key={tool.id}
          aria-label={tool.label}
          title={`${tool.label} (${tool.shortcut})`}
          variant="ghost"
          disabled={!selectedId}
          onClick={() => layerActions[tool.action]()}
        >
          {tool.icon}
        </IconButton>
      ))}
    </aside>
  );
}
