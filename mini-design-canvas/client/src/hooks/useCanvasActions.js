import { useCallback, useRef, useState, useEffect } from 'react';
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

/**
 * Hook encapsulating all canvas persistence workflows.
 * Guarantees that UI components interact only through this hook, never calling
 * the API layer or managing HTTP concerns directly.
 */
export function useCanvasActions() {
  const canvasId = useEditorStore(selectCanvasId);
  const canvasName = useEditorStore(selectCanvasName);
  const elements = useEditorStore(selectElements);
  const isDirty = useEditorStore(selectIsDirty);

  const loadCanvas = useEditorStore((s) => s.loadCanvas);
  const resetCanvas = useEditorStore((s) => s.resetCanvas);
  const markSaved = useEditorStore((s) => s.markSaved);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // AbortController refs to cancel stale requests
  const openAbortRef = useRef(null);
  const listAbortRef = useRef(null);
  const saveAbortRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      openAbortRef.current?.abort();
      listAbortRef.current?.abort();
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
      setIsLoading(true);
      setIsCreating(true);
      setError(null);

      try {
        const payload = {
          name: trimmedName,
          width: CANVAS_DEFAULTS.WIDTH,
          height: CANVAS_DEFAULTS.HEIGHT,
          elements: [],
        };

        const response = await canvasApi.createCanvas(payload);
        const createdCanvas = response.data;

        if (isMountedRef.current) {
          loadCanvas(createdCanvas);
        }
        return createdCanvas;
      } catch (err) {
        const formatted = formatApiError(err);
        if (isMountedRef.current) {
          setError(formatted);
        }
        throw new Error(formatted);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsCreating(false);
        }
      }
    },
    [loadCanvas],
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

    setIsLoading(true);
    setIsSaving(true);
    setError(null);

    const payload = {
      name: (canvasName || '').trim() || CANVAS_DEFAULTS.NAME,
      width: CANVAS_DEFAULTS.WIDTH,
      height: CANVAS_DEFAULTS.HEIGHT,
      elements,
    };

    try {
      let response;
      if (canvasId) {
        response = await canvasApi.updateCanvas(
          canvasId,
          payload,
          saveAbortRef.current.signal,
        );
      } else {
        response = await canvasApi.createCanvas(
          payload,
          saveAbortRef.current.signal,
        );
      }

      const savedCanvas = response.data;
      if (isMountedRef.current) {
        markSaved(savedCanvas);
      }
      return savedCanvas;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      const formatted = formatApiError(err);
      if (isMountedRef.current) {
        setError(formatted);
      }
      throw new Error(formatted);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsSaving(false);
      }
    }
  }, [canvasId, canvasName, elements, markSaved]);

  /**
   * Opens an existing canvas by ID.
   * Cancels any in-flight open requests via AbortController so rapid clicks
   * don't lead to race conditions or stale state.
   *
   * @param {string} id - Canvas ObjectId
   * @returns {Promise<object>} Loaded canvas document
   */
  const open = useCallback(
    async (id) => {
      // Cancel any prior in-flight open request
      if (openAbortRef.current) {
        openAbortRef.current.abort();
      }
      openAbortRef.current = new AbortController();

      setIsLoading(true);
      setIsOpening(true);
      setError(null);

      try {
        const response = await canvasApi.getCanvas(
          id,
          openAbortRef.current.signal,
        );
        const fetchedCanvas = response.data;

        if (isMountedRef.current) {
          loadCanvas(fetchedCanvas);
        }
        return fetchedCanvas;
      } catch (err) {
        if (err.name === 'AbortError') return null;
        const formatted = formatApiError(err);
        if (isMountedRef.current) {
          setError(formatted);
        }
        throw new Error(formatted);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsOpening(false);
        }
      }
    },
    [loadCanvas],
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
      setIsLoading(true);
      setIsDeleting(true);
      setError(null);

      try {
        await canvasApi.deleteCanvas(id);
        if (isMountedRef.current && canvasId === id) {
          resetCanvas();
        }
        return true;
      } catch (err) {
        const formatted = formatApiError(err);
        if (isMountedRef.current) {
          setError(formatted);
        }
        throw new Error(formatted);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsDeleting(false);
        }
      }
    },
    [canvasId, resetCanvas],
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
    clearError: () => setError(null),
  };
}
