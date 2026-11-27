import { useCallback, useEffect, useRef } from 'react';
import { createDebouncedFn } from '../utils/debounce.js';

/**
 * Returns a debounced version of `callback` that delays invocation until
 * `delay` ms have elapsed since the last call.
 *
 * The returned function is stable across renders (referential equality
 * guaranteed by useCallback). Any in-flight timer is automatically
 * cancelled on component unmount.
 *
 * @param {(...args: any[]) => void} callback - Function to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {(...args: any[]) => void} Debounced function
 *
 * @example
 * const debouncedSave = useDebouncedCallback(save, 1500);
 */
export function useDebouncedCallback(callback, delay) {
  const callbackRef = useRef(callback);
  const debouncedRef = useRef(null);

  // Keep the latest callback without re-creating the debounced wrapper
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Create debounced wrapper and cancel on unmount or delay change
  useEffect(() => {
    const debounced = createDebouncedFn((...args) => {
      callbackRef.current(...args);
    }, delay);

    debouncedRef.current = debounced;

    return () => {
      debounced.cancel();
    };
  }, [delay]);

  return useCallback((...args) => {
    debouncedRef.current?.(...args);
  }, []);
}
