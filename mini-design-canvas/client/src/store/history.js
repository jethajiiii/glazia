/**
 * Pure, reusable history management utilities for undo/redo stacks.
 * Completely independent of React and Konva, using structural sharing
 * and enforcing a maximum history depth.
 */

export const MAX_HISTORY_DEPTH = 50;

/**
 * Creates a clean history state object.
 *
 * @returns {{ past: Array<object>, future: Array<object> }}
 */
export function createHistoryState() {
  return {
    past: [],
    future: [],
  };
}

/**
 * Pushes a new snapshot to the past stack, clears the future stack,
 * and trims oldest history entries if exceeding maxDepth.
 *
 * @param {{ past: Array<object>, future: Array<object> }} history
 * @param {object} snapshot - State snapshot to record
 * @param {number} [maxDepth=MAX_HISTORY_DEPTH] - Maximum stack capacity
 * @returns {{ past: Array<object>, future: Array<object> }} New history state
 */
export function pushSnapshot(history, snapshot, maxDepth = MAX_HISTORY_DEPTH) {
  if (!snapshot) return history;

  const nextPast = [...history.past, snapshot];
  if (nextPast.length > maxDepth) {
    nextPast.splice(0, nextPast.length - maxDepth);
  }

  return {
    past: nextPast,
    future: [],
  };
}

/**
 * Undoes the most recent action.
 * Pops from the past stack, pushes the current snapshot to future.
 *
 * @param {{ past: Array<object>, future: Array<object> }} history
 * @param {object} currentSnapshot - Snapshot representing current state
 * @returns {{
 *   history: { past: Array<object>, future: Array<object> },
 *   restored: object | null
 * }}
 */
export function undoHistory(history, currentSnapshot) {
  if (history.past.length === 0) {
    return { history, restored: null };
  }

  const nextPast = [...history.past];
  const restored = nextPast.pop();
  const nextFuture = [currentSnapshot, ...history.future];

  return {
    history: {
      past: nextPast,
      future: nextFuture,
    },
    restored,
  };
}

/**
 * Redoes the most recently undone action.
 * Pops from the future stack, pushes the current snapshot to past.
 *
 * @param {{ past: Array<object>, future: Array<object> }} history
 * @param {object} currentSnapshot - Snapshot representing current state
 * @param {number} [maxDepth=MAX_HISTORY_DEPTH]
 * @returns {{
 *   history: { past: Array<object>, future: Array<object> },
 *   restored: object | null
 * }}
 */
export function redoHistory(history, currentSnapshot, maxDepth = MAX_HISTORY_DEPTH) {
  if (history.future.length === 0) {
    return { history, restored: null };
  }

  const [restored, ...nextFuture] = history.future;
  const nextPast = [...history.past, currentSnapshot];

  if (nextPast.length > maxDepth) {
    nextPast.splice(0, nextPast.length - maxDepth);
  }

  return {
    history: {
      past: nextPast,
      future: nextFuture,
    },
    restored,
  };
}

/**
 * Checks whether an undo action is available.
 *
 * @param {{ past: Array<any> }} history
 * @returns {boolean}
 */
export function canUndo(history) {
  return Array.isArray(history?.past) && history.past.length > 0;
}

/**
 * Checks whether a redo action is available.
 *
 * @param {{ future: Array<any> }} history
 * @returns {boolean}
 */
export function canRedo(history) {
  return Array.isArray(history?.future) && history.future.length > 0;
}
