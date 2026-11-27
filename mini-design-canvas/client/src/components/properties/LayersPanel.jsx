import { useEditorStore } from '../../store/useEditorStore.js';
import { selectElements, selectSelectedId } from '../../store/selectors.js';
import { ELEMENT_LABELS } from '../../constants/elementTypes.js';

/** Unicode icon per element type for quick visual identification. */
const ELEMENT_TYPE_ICONS = Object.freeze({
  rect: '▭',
  circle: '○',
  text: 'T',
});

/**
 * Optional Layers Panel listing all canvas elements in visual z-order
 * (top of list = front-most element).
 *
 * Clicking a row selects that element in the editor.
 * The active selection is highlighted.
 *
 * @returns {JSX.Element}
 */
export function LayersPanel() {
  const elements = useEditorStore(selectElements);
  const selectedId = useEditorStore(selectSelectedId);
  const selectElement = useEditorStore((state) => state.selectElement);

  if (elements.length === 0) {
    return (
      <section className="layers-panel" aria-label="Layers Panel">
        <header className="layers-panel__header">
          <span className="layers-panel__title">Layers</span>
        </header>
        <p className="layers-panel__empty">No elements on canvas</p>
      </section>
    );
  }

  // Reverse so front-most element (last in array) appears at the top of the list
  const reversed = [...elements].reverse();

  return (
    <section className="layers-panel" aria-label="Layers Panel">
      <header className="layers-panel__header">
        <span className="layers-panel__title">Layers</span>
        <span className="layers-panel__count">{elements.length}</span>
      </header>

      <ol className="layers-panel__list" role="listbox" aria-label="Element layers">
        {reversed.map((el) => {
          const isActive = el.id === selectedId;
          const icon = ELEMENT_TYPE_ICONS[el.type] ?? '?';
          const label = ELEMENT_LABELS[el.type] ?? el.type;
          const displayName = el.text
            ? `${label}: ${el.text.slice(0, 20)}${el.text.length > 20 ? '…' : ''}`
            : label;

          return (
            <li
              key={el.id}
              role="option"
              aria-selected={isActive}
              className={`layers-panel__item${isActive ? ' layers-panel__item--active' : ''}`}
              onClick={() => selectElement(el.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectElement(el.id);
                }
              }}
            >
              <span className="layers-panel__icon" aria-hidden="true">
                {icon}
              </span>
              <span className="layers-panel__name">{displayName}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
