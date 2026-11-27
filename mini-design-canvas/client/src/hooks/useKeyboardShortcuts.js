import { useEffect } from 'react';
import { KEYBOARD_KEYS } from '../constants/defaults.js';
import { useEditorStore } from '../store/useEditorStore.js';
import { selectSelectedElement } from '../store/selectors.js';

/**
 * Checks whether user focus is currently within an editable text input or form field.
 */
function isFocusInTextInput() {
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName.toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || active.isContentEditable;
}

/**
 * Hook registering global canvas keyboard shortcuts:
 * - Delete / Backspace: deletes the selected shape
 * - Escape: deselects current selection
 * - Arrow Keys: nudges selected element position (1px or 10px with Shift)
 */
export function useKeyboardShortcuts() {
  const selectedElement = useEditorStore(selectSelectedElement);
  const deleteElement = useEditorStore((state) => state.deleteElement);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const updateElement = useEditorStore((state) => state.updateElement);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcuts while user is actively typing in form inputs
      if (isFocusInTextInput()) return;

      const { key, shiftKey } = e;

      // 1. Delete / Backspace
      if (key === KEYBOARD_KEYS.DELETE || key === KEYBOARD_KEYS.BACKSPACE) {
        if (selectedElement) {
          e.preventDefault();
          deleteElement(selectedElement.id);
        }
        return;
      }

      // 2. Escape to deselect
      if (key === KEYBOARD_KEYS.ESCAPE) {
        clearSelection();
        return;
      }

      // 3. Arrow Keys to nudge selected element
      if (
        selectedElement &&
        (key === KEYBOARD_KEYS.ARROW_UP ||
          key === KEYBOARD_KEYS.ARROW_DOWN ||
          key === KEYBOARD_KEYS.ARROW_LEFT ||
          key === KEYBOARD_KEYS.ARROW_RIGHT)
      ) {
        e.preventDefault();
        const step = shiftKey ? 10 : 1;

        let deltaX = 0;
        let deltaY = 0;

        if (key === KEYBOARD_KEYS.ARROW_LEFT) deltaX = -step;
        if (key === KEYBOARD_KEYS.ARROW_RIGHT) deltaX = step;
        if (key === KEYBOARD_KEYS.ARROW_UP) deltaY = -step;
        if (key === KEYBOARD_KEYS.ARROW_DOWN) deltaY = step;

        updateElement(selectedElement.id, {
          x: selectedElement.x + deltaX,
          y: selectedElement.y + deltaY,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, deleteElement, clearSelection, updateElement]);
}
