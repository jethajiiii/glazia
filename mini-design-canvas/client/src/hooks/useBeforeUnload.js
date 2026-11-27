import { useEffect } from 'react';

/**
 * Hook to guard against accidental browser tab close or reload when canvas has unsaved changes.
 *
 * @param {boolean} isDirty - Whether there are unsaved changes
 */
export function useBeforeUnload(isDirty) {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      // Modern browsers require setting returnValue
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);
}
