/**
 * Creates a debounced function that delays invoking `func` until after `delay` ms
 * have elapsed since the last time the debounced function was invoked.
 *
 * Provides a `cancel()` method to abort any scheduled execution.
 *
 * @param {(...args: any[]) => void} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {((...args: any[]) => void) & { cancel: () => void }}
 */
export function createDebouncedFn(func, delay) {
  let timerId = null;

  function debounced(...args) {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      timerId = null;
      func(...args);
    }, delay);
  }

  debounced.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}
