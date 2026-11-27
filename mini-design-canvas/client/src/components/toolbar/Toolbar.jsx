import { ELEMENT_TYPES, ELEMENT_LABELS } from '../../constants/elementTypes.js';
import { IconButton } from '../ui/IconButton.jsx';
import { useEditorStore } from '../../store/useEditorStore.js';
import { selectSelectedId } from '../../store/selectors.js';

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
 * Config-driven Toolbar component for canvas tool selection and element deletion.
 *
 * @param {{
 *   activeTool: string,
 *   onSelectTool: (toolId: string) => void
 * }} props
 */
export function Toolbar({ activeTool, onSelectTool }) {
  const selectedId = useEditorStore(selectSelectedId);
  const deleteElement = useEditorStore((state) => state.deleteElement);

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
    </aside>
  );
}
