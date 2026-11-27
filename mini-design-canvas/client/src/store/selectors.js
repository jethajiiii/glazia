/**
 * Named Zustand selectors for optimal component subscription granularity.
 * Components subscribing via selectors only re-render when their specific slice changes.
 */

export const selectCanvasId = (state) => state.canvasId;

export const selectCanvasName = (state) => state.canvasName;

export const selectElements = (state) => state.elements;

export const selectSelectedId = (state) => state.selectedId;

export const selectIsDirty = (state) => state.isDirty;

export const selectElementsCount = (state) => state.elements.length;

export const selectHasSelectedElement = (state) => state.selectedId !== null;

export const selectCanUndo = (state) =>
  Array.isArray(state.history?.past) && state.history.past.length > 0;

export const selectCanRedo = (state) =>
  Array.isArray(state.history?.future) && state.history.future.length > 0;

/**
 * Returns the currently selected element object, or null if none selected.
 */
export const selectSelectedElement = (state) =>
  state.elements.find((el) => el.id === state.selectedId) || null;

/**
 * Higher-order selector factory to retrieve an element by its ID.
 *
 * @param {string} id - Element ID
 * @returns {(state: object) => object | null}
 */
export const selectElementById = (id) => (state) =>
  state.elements.find((el) => el.id === id) || null;
