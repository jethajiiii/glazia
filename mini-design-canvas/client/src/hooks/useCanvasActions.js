import { useCallback, useRef, useEffect } from 'react';
import { canvasApi } from '../api/canvasApi.js';
import { useEditorStore } from '../store/useEditorStore.js';
import {
  selectCanvasId,
  selectCanvasName,
  selectElements,
  selectIsDirty,
} from '../store/selectors.js';
import { CANVAS_DEFAULTS } from '../constants/defaults.js';
import { formatApiError } from '../utils/errorUtils.js';
import { useAsync } from './useAsync.js';

/**
 * Hook encapsulating all canvas persistence workflows.
 * Guarantees that UI components interact only through this hook, never calling
 * the API layer or managing HTTP concerns directly.
 * Uses useAsync internally for unified loading and error state management.
 */
export function useCanvasActions() {
  const canvasId = useEditorStore(selectCanvasId);
  const canvasName = useEditorStore(selectCanvasName);
  const elements = useEditorStore(selectElements);
  const isDirty = useEditorStore(selectIsDirty);

  const loadCanvas = useEditorStore((s) => s.loadCanvas);
  const resetCanvas = useEditorStore((s) => s.resetCanvas);
  const markSaved = useEditorStore((s) => s.markSaved);

  // useAsync instances for fine-grained action status and error tracking
  const { run: runSave, isLoading: isSaving, error: saveError } = useAsync();
  const { run: runOpen, isLoading: isOpening, error: openError } = useAsync();
  const { run: runCreate, isLoading: isCreating, error: createError } = useAsync();
  const { run: runDelete, isLoading: isDeleting, error: deleteError } = useAsync();

  const isLoading = isSaving || isOpening || isCreating || isDeleting;
  const rawError = saveError || openError || createError || deleteError;
  const error = rawError ? formatApiError(rawError) : null;

  // AbortController refs to cancel stale requests (e.g. fast consecutive clicks)
  const openAbortRef = useRef(null);
  const saveAbortRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      openAbortRef.current?.abort();
      saveAbortRef.current?.abort();
    };
  }, []);

  /**
   * Creates a new canvas on the backend with an initial blank canvas,
   * assigns it an ID from the database, and loads it into the store.
   *
   * @param {string} [name] - Desired canvas name
   * @returns {Promise<object>} Created canvas document
   */
  const createNew = useCallback(
    async (name) => {
      const trimmedName = (name || '').trim() || CANVAS_DEFAULTS.NAME;
      const payload = {
        name: trimmedName,
        width: CANVAS_DEFAULTS.WIDTH,
        height: CANVAS_DEFAULTS.HEIGHT,
        elements: [],
      };

      try {
        const response = await runCreate(canvasApi.createCanvas(payload));
        const createdCanvas = response.data;
        if (isMountedRef.current) {
          loadCanvas(createdCanvas);
        }
        return createdCanvas;
      } catch (err) {
        throw new Error(formatApiError(err));
      }
    },
    [runCreate, loadCanvas],
  );

  /**
   * Saves the active canvas to MongoDB.
   * If existing canvas (has canvasId), issues a PUT update.
   * If new canvas (canvasId === null), issues a POST create.
   *
   * @returns {Promise<object>} Saved canvas document
   */
  const save = useCallback(async () => {
    saveAbortRef.current?.abort();
    saveAbortRef.current = new AbortController();

    const payload = {
      name: (canvasName || '').trim() || CANVAS_DEFAULTS.NAME,
      width: CANVAS_DEFAULTS.WIDTH,
      height: CANVAS_DEFAULTS.HEIGHT,
      elements,
    };

    try {
      const savePromise = canvasId
        ? canvasApi.updateCanvas(canvasId, payload, saveAbortRef.current.signal)
        : canvasApi.createCanvas(payload, saveAbortRef.current.signal);

      const response = await runSave(savePromise);
      const savedCanvas = response.data;
      if (isMountedRef.current) {
        markSaved(savedCanvas);
      }
      return savedCanvas;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      throw new Error(formatApiError(err));
    }
  }, [canvasId, canvasName, elements, runSave, markSaved]);

  /**
   * Opens an existing canvas by ID.
   * Cancels any in-flight open requests via AbortController so rapid clicks
   * do not lead to race conditions or stale state.
   *
   * @param {string} id - Canvas ObjectId
   * @returns {Promise<object>} Loaded canvas document
   */
  const open = useCallback(
    async (id) => {
      if (openAbortRef.current) {
        openAbortRef.current.abort();
      }
      openAbortRef.current = new AbortController();

      try {
        const response = await runOpen(
          canvasApi.getCanvas(id, openAbortRef.current.signal),
        );
        const fetchedCanvas = response.data;
        if (isMountedRef.current) {
          loadCanvas(fetchedCanvas);
        }
        return fetchedCanvas;
      } catch (err) {
        if (err.name === 'AbortError') return null;
        throw new Error(formatApiError(err));
      }
    },
    [runOpen, loadCanvas],
  );

  /**
   * Deletes a canvas by ID from MongoDB.
   * If the deleted canvas is currently open in the editor, resets the editor.
   *
   * @param {string} id - Canvas ObjectId
   * @returns {Promise<boolean>}
   */
  const remove = useCallback(
    async (id) => {
      try {
        await runDelete(canvasApi.deleteCanvas(id));
        if (isMountedRef.current && canvasId === id) {
          resetCanvas();
        }
        return true;
      } catch (err) {
        throw new Error(formatApiError(err));
      }
    },
    [canvasId, runDelete, resetCanvas],
  );

  /**
   * Fetches summary list of saved canvases from the backend.
   *
   * @param {AbortSignal} [signal]
   * @returns {Promise<Array<{ _id: string, name: string, updatedAt: string }>>}
   */
  const listCanvases = useCallback(async (signal) => {
    try {
      const response = await canvasApi.listCanvases(signal);
      return response.data || [];
    } catch (err) {
      if (err.name === 'AbortError') return [];
      throw new Error(formatApiError(err));
    }
  }, []);

  return {
    createNew,
    save,
    open,
    remove,
    listCanvases,
    canvasId,
    canvasName,
    isDirty,
    isLoading,
    isSaving,
    isOpening,
    isCreating,
    isDeleting,
    error,
  };
}
