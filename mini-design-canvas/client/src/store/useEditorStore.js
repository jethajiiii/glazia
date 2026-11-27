import { create } from 'zustand';
import { CANVAS_DEFAULTS } from '../constants/defaults.js';
import { createElement } from '../utils/elementFactory.js';
import {
  bringForward as arrayBringForward,
  sendBackward as arraySendBackward,
  bringToFront as arrayBringToFront,
  sendToBack as arraySendToBack,
  reorderById,
} from '../utils/arrayOrder.js';
import {
  createHistoryState,
  pushSnapshot,
  undoHistory,
  redoHistory,
} from './history.js';

/**
 * Creates an immutable snapshot of reversible editor state.
 *
 * @param {object} state
 * @returns {{ elements: Array<object>, canvasName: string, selectedId: string | null }}
 */
function createSnapshot(state) {
  return {
    elements: state.elements,
    canvasName: state.canvasName,
    selectedId: state.selectedId,
  };
}

/**
 * Editor Zustand store managing canvas design state, element collection,
 * layer z-index order, history (undo/redo), and selection.
 */
export const useEditorStore = create((set, get) => ({
  // State
  canvasId: null,
  canvasName: CANVAS_DEFAULTS.NAME,
  elements: [],
  selectedId: null,
  isDirty: false,
  history: createHistoryState(),

  // Actions

  /**
   * Adds a new shape to the canvas, selects it, records history, and marks canvas dirty.
   *
   * @param {'rect' | 'circle' | 'text'} type
   * @param {object} [overrides]
   * @returns {object} Created element
   */
  addElement: (type, overrides = {}) => {
    const newElement = createElement(type, overrides);
    set((state) => ({
      history: pushSnapshot(state.history, createSnapshot(state)),
      elements: [...state.elements, newElement],
      selectedId: newElement.id,
      isDirty: true,
    }));
    return newElement;
  },

  /**
   * Updates an existing element by ID with a partial property patch.
   * Records history snapshot and marks canvas dirty.
   *
   * @param {string} id - Element ID
   * @param {object} patch - Property patch
   */
  updateElement: (id, patch) => {
    set((state) => {
      let found = false;
      const nextElements = state.elements.map((el) => {
        if (el.id !== id) return el;
        found = true;
        return { ...el, ...patch };
      });

      if (!found) return state;

      return {
        history: pushSnapshot(state.history, createSnapshot(state)),
        elements: nextElements,
        isDirty: true,
      };
    });
  },

  /**
   * Deletes an element by ID (or currently selected element if omitted).
   * Records history snapshot and marks canvas dirty.
   *
   * @param {string} [id] - Target element ID
   */
  deleteElement: (id) => {
    set((state) => {
      const targetId = id || state.selectedId;
      if (!targetId) return state;

      const nextElements = state.elements.filter((el) => el.id !== targetId);
      if (nextElements.length === state.elements.length) return state;

      return {
        history: pushSnapshot(state.history, createSnapshot(state)),
        elements: nextElements,
        selectedId: state.selectedId === targetId ? null : state.selectedId,
        isDirty: true,
      };
    });
  },

  /**
   * Moves element one step forward in z-order (closer to front).
   *
   * @param {string} [id] - Element ID (defaults to selectedId)
   */
  bringForward: (id) => {
    set((state) => {
      const targetId = id || state.selectedId;
      if (!targetId) return state;

      const nextElements = reorderById(state.elements, targetId, arrayBringForward);
      if (nextElements === state.elements) return state;

      return {
        history: pushSnapshot(state.history, createSnapshot(state)),
        elements: nextElements,
        isDirty: true,
      };
    });
  },

  /**
   * Moves element one step backward in z-order (closer to back).
   *
   * @param {string} [id] - Element ID (defaults to selectedId)
   */
  sendBackward: (id) => {
    set((state) => {
      const targetId = id || state.selectedId;
      if (!targetId) return state;

      const nextElements = reorderById(state.elements, targetId, arraySendBackward);
      if (nextElements === state.elements) return state;

      return {
        history: pushSnapshot(state.history, createSnapshot(state)),
        elements: nextElements,
        isDirty: true,
      };
    });
  },

  /**
   * Moves element to the front of all other layers.
   *
   * @param {string} [id] - Element ID (defaults to selectedId)
   */
  bringToFront: (id) => {
    set((state) => {
      const targetId = id || state.selectedId;
      if (!targetId) return state;

      const nextElements = reorderById(state.elements, targetId, arrayBringToFront);
      if (nextElements === state.elements) return state;

      return {
        history: pushSnapshot(state.history, createSnapshot(state)),
        elements: nextElements,
        isDirty: true,
      };
    });
  },

  /**
   * Moves element to the back behind all other layers.
   *
   * @param {string} [id] - Element ID (defaults to selectedId)
   */
  sendToBack: (id) => {
    set((state) => {
      const targetId = id || state.selectedId;
      if (!targetId) return state;

      const nextElements = reorderById(state.elements, targetId, arraySendToBack);
      if (nextElements === state.elements) return state;

      return {
        history: pushSnapshot(state.history, createSnapshot(state)),
        elements: nextElements,
        isDirty: true,
      };
    });
  },

  /**
   * Reverts the most recent change.
   */
  undo: () => {
    const state = get();
    const current = createSnapshot(state);
    const { history: nextHistory, restored } = undoHistory(state.history, current);

    if (!restored) return;

    set({
      history: nextHistory,
      elements: restored.elements,
      canvasName: restored.canvasName ?? state.canvasName,
      selectedId: restored.selectedId ?? null,
      isDirty: true,
    });
  },

  /**
   * Re-applies the most recently undone change.
   */
  redo: () => {
    const state = get();
    const current = createSnapshot(state);
    const { history: nextHistory, restored } = redoHistory(state.history, current);

    if (!restored) return;

    set({
      history: nextHistory,
      elements: restored.elements,
      canvasName: restored.canvasName ?? state.canvasName,
      selectedId: restored.selectedId ?? null,
      isDirty: true,
    });
  },

  /**
   * Sets the active selected element ID.
   *
   * @param {string | null} id
   */
  selectElement: (id) => {
    set((state) => {
      if (state.selectedId === id) return state;
      return { selectedId: id };
    });
  },

  /**
   * Clears any active element selection.
   */
  clearSelection: () => {
    set((state) => {
      if (state.selectedId === null) return state;
      return { selectedId: null };
    });
  },

  /**
   * Loads an existing canvas payload from persistence into the editor.
   * Resets history stack completely.
   *
   * @param {object} canvas - Saved canvas document
   */
  loadCanvas: (canvas) => {
    set({
      canvasId: canvas._id || canvas.id || null,
      canvasName: canvas.name || CANVAS_DEFAULTS.NAME,
      elements: Array.isArray(canvas.elements) ? [...canvas.elements] : [],
      selectedId: null,
      isDirty: false,
      history: createHistoryState(),
    });
  },

  /**
   * Resets the editor to a blank canvas state.
   * Resets history stack completely.
   *
   * @param {string} [name=CANVAS_DEFAULTS.NAME]
   */
  resetCanvas: (name = CANVAS_DEFAULTS.NAME) => {
    set({
      canvasId: null,
      canvasName: name,
      elements: [],
      selectedId: null,
      isDirty: false,
      history: createHistoryState(),
    });
  },

  /**
   * Sets canvas title name and marks dirty.
   *
   * @param {string} name
   */
  setCanvasName: (name) => {
    set((state) => {
      if (state.canvasName === name) return state;
      return {
        history: pushSnapshot(state.history, createSnapshot(state)),
        canvasName: name,
        isDirty: true,
      };
    });
  },

  /**
   * Resets dirty state after successful save, optionally updating saved ID.
   *
   * @param {object} [savedCanvas]
   */
  markSaved: (savedCanvas = null) => {
    set((state) => ({
      isDirty: false,
      ...(savedCanvas && {
        canvasId: savedCanvas._id || savedCanvas.id || state.canvasId,
        canvasName: savedCanvas.name || state.canvasName,
      }),
    }));
  },
}));
