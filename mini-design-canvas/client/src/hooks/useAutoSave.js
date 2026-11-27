import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '../store/useEditorStore.js';
import {
  selectIsDirty,
  selectCanvasId,
  selectElements,
  selectCanvasName,
} from '../store/selectors.js';
import { useDebouncedCallback } from './useDebouncedCallback.js';

/** Debounce delay (ms) before an auto-save is triggered after the last change. */
export const AUTO_SAVE_DELAY_MS = 2000;

/**
 * @typedef {'idle' | 'saving' | 'saved' | 'error'} AutoSaveStatus
 */

/**
 * Hook that automatically saves the canvas after a debounced idle period
 * whenever the canvas is dirty and has a persisted ID (never saves new unsaved canvases).
 *
 * Guarantees no two saves overlap in-flight: an in-flight save is awaited or aborted
 * before any subsequent save starts.
 *
 * @param {(signal?: AbortSignal) => Promise<object>} saveFn
 *   Async save function (from useCanvasActions). Must accept an optional AbortSignal.
 * @param {{ enabled?: boolean }} [options]
 *   - `enabled`: Whether auto-save is active. Defaults to `true`.
 * @returns {{
 *   status: AutoSaveStatus,
 *   isEnabled: boolean,
 *   toggle: () => void
 * }}
 */
export function useAutoSave(saveFn, { enabled = true } = {}) {
  const isDirty = useEditorStore(selectIsDirty);
  const canvasId = useEditorStore(selectCanvasId);
  const elements = useEditorStore(selectElements);
  const canvasName = useEditorStore(selectCanvasName);

  const [status, setStatus] = useState('idle');
  const [isEnabled, setIsEnabled] = useState(enabled);

  // AbortController ref and in-flight lock to guarantee no overlapping saves
  const abortRef = useRef(null);
  const inFlightRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  /** Cancels any in-flight save and fires a new one safely. */
  const performSave = useCallback(async () => {
    if (!isMountedRef.current) return;

    // Guard against overlapping in-flight saves: abort prior save if still running
    if (inFlightRef.current) {
      abortRef.current?.abort();
    }

    abortRef.current = new AbortController();
    inFlightRef.current = true;

    setStatus('saving');
    try {
      await saveFn(abortRef.current.signal);
      if (isMountedRef.current) {
        setStatus('saved');
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      if (isMountedRef.current) {
        setStatus('error');
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [saveFn]);

  const debouncedSave = useDebouncedCallback(performSave, AUTO_SAVE_DELAY_MS);

  // Trigger auto-save whenever changes happen to dirty, persisted canvas
  useEffect(() => {
    if (!isEnabled) return;
    if (!isDirty) return;
    if (!canvasId) return; // Only auto-save canvases that exist on backend

    debouncedSave();
  }, [isDirty, canvasId, elements, canvasName, isEnabled, debouncedSave]);

  // Reset status badge when canvas is no longer dirty (e.g. manual save occurred)
  useEffect(() => {
    if (!isDirty && status === 'saved') {
      const id = setTimeout(() => {
        if (isMountedRef.current) setStatus('idle');
      }, 2000);
      return () => clearTimeout(id);
    }
  }, [isDirty, status]);

  const toggle = useCallback(() => setIsEnabled((prev) => !prev), []);

  return { status, isEnabled, toggle };
}
