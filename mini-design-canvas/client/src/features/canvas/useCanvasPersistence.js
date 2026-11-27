import { useCallback } from 'react';
import { canvasApi } from '../../api/canvasApi.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import {
  selectCanvasId,
  selectCanvasName,
  selectElements,
} from '../../store/selectors.js';
import { CANVAS_DEFAULTS } from '../../constants/defaults.js';

/**
 * @typedef {object} PersistenceResult
 * @property {(signal?: AbortSignal) => Promise<void>} save        - Create or update the canvas on the backend.
 * @property {(id: string, signal?: AbortSignal) => Promise<void>} load - Fetch a canvas from the backend and load it into the store.
 * @property {(id: string, signal?: AbortSignal) => Promise<void>} remove - Delete a canvas from the backend by ID.
 */

/**
 * Builds the payload sent to the API from current store state.
 *
 * @param {string} name
 * @param {object[]} elements
 * @returns {{ name: string, width: number, height: number, elements: object[] }}
 */
export function buildPayload(name, elements) {
  return {
    name: (name || '').trim() || CANVAS_DEFAULTS.NAME,
    width: CANVAS_DEFAULTS.WIDTH,
    height: CANVAS_DEFAULTS.HEIGHT,
    elements: Array.isArray(elements) ? elements : [],
  };
}

/**
 * Returns save / load / remove callbacks wired to the editor store and canvasApi.
 * Has zero HTTP concerns — it only orchestrates the api layer and the store.
 * Callers are responsible for loading state and error handling (use with useAsync).
 *
 * @returns {PersistenceResult}
 */
export function useCanvasPersistence() {
  const canvasId = useEditorStore(selectCanvasId);
  const canvasName = useEditorStore(selectCanvasName);
  const elements = useEditorStore(selectElements);

  const markSaved = useEditorStore((s) => s.markSaved);
  const loadCanvas = useEditorStore((s) => s.loadCanvas);

  /**
   * Saves the current canvas.  Creates a new record when no canvasId exists;
   * updates the existing record otherwise.
   */
  const save = useCallback(
    async (signal) => {
      const payload = buildPayload(canvasName, elements);

      let response;
      if (canvasId) {
        response = await canvasApi.updateCanvas(canvasId, payload, signal);
      } else {
        response = await canvasApi.createCanvas(payload, signal);
      }

      // response.data is the saved canvas document
      markSaved(response.data);
      return response.data;
    },
    [canvasId, canvasName, elements, markSaved],
  );

  /**
   * Loads a canvas by its _id from the backend into the editor store.
   *
   * @param {string} id
   */
  const load = useCallback(
    async (id, signal) => {
      const response = await canvasApi.getCanvas(id, signal);
      loadCanvas(response.data);
    },
    [loadCanvas],
  );

  /**
   * Deletes a canvas by ID from the backend.
   * Does NOT modify local store state — caller decides what happens next.
   *
   * @param {string} id
   */
  const remove = useCallback(async (id, signal) => {
    await canvasApi.deleteCanvas(id, signal);
  }, []);

  return { save, load, remove };
}
