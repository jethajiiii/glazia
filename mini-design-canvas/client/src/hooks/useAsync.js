import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook to execute asynchronous operations with unified loading, error, and data states.
 * Automatically prevents state updates if the component has unmounted.
 *
 * @param {object} [initialState]
 * @returns {{
 *   run: (promise: Promise<any>) => Promise<any>,
 *   isLoading: boolean,
 *   error: Error | null,
 *   data: any,
 *   reset: () => void
 * }}
 */
export function useAsync(initialState = { data: null, isLoading: false, error: null }) {
  const [state, setState] = useState(initialState);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const run = useCallback(async (promise) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await promise;
      if (isMountedRef.current) {
        setState({ data, isLoading: false, error: null });
      }
      return data;
    } catch (error) {
      if (isMountedRef.current) {
        setState({ data: null, isLoading: false, error });
      }
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setState({ data: null, isLoading: false, error: null });
    }
  }, []);

  return {
    ...state,
    run,
    reset,
  };
}
