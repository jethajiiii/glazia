import { create } from 'zustand';
import { CANVAS_DEFAULTS } from '../constants/defaults.js';
import { createElement } from '../utils/elementFactory.js';

/**
 * Editor Zustand store managing canvas design state, element collection,
 * selection, and persistence dirtiness.
 */
export const useEditorStore = create((set) => ({
  // State
  canvasId: null,
  canvasName: CANVAS_DEFAULTS.NAME,
  elements: [],
  selectedId: null,
  isDirty: false,

  // Actions
  /**
   * Adds a new shape to the canvas, selects it, and marks canvas dirty.
   *
   * @param {'rect' | 'circle' | 'text'} type
   * @param {object} [overrides]
   * @returns {object} Created element
   */
  addElement: (type, overrides = {}) => {
    const newElement = createElement(type, overrides);
    set((state) => ({
      elements: [...state.elements, newElement],
      selectedId: newElement.id,
      isDirty: true,
    }));
    return newElement;
  },

  /**
   * Updates an existing element by ID with a partial property patch.
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
        elements: nextElements,
        isDirty: true,
      };
    });
  },

  /**
   * Deletes an element by ID (or the currently selected element if ID omitted).
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
        elements: nextElements,
        selectedId: state.selectedId === targetId ? null : state.selectedId,
        isDirty: true,
      };
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
    });
  },

  /**
   * Resets the editor to a blank canvas state.
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
