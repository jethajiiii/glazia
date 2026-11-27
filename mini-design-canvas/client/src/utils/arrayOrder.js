/**
 * Pure, immutable array reordering utilities for layer z-index manipulation.
 * Elements rendered later in an array appear on top in 2D canvases.
 */

/**
 * Moves an item at the given index one step closer to the front (towards the end of the array).
 *
 * @template T
 * @param {T[]} array - Source array
 * @param {number} index - Index of element to move forward
 * @returns {T[]} New reordered array, or same array reference if unable to move
 */
export function bringForward(array, index) {
  if (!Array.isArray(array) || index < 0 || index >= array.length - 1) {
    return array;
  }

  const next = [...array];
  const temp = next[index];
  next[index] = next[index + 1];
  next[index + 1] = temp;
  return next;
}

/**
 * Moves an item at the given index one step closer to the back (towards index 0).
 *
 * @template T
 * @param {T[]} array - Source array
 * @param {number} index - Index of element to move backward
 * @returns {T[]} New reordered array, or same array reference if unable to move
 */
export function sendBackward(array, index) {
  if (!Array.isArray(array) || index <= 0 || index >= array.length) {
    return array;
  }

  const next = [...array];
  const temp = next[index];
  next[index] = next[index - 1];
  next[index - 1] = temp;
  return next;
}

/**
 * Moves an item at the given index to the very front of the canvas (end of array).
 *
 * @template T
 * @param {T[]} array - Source array
 * @param {number} index - Index of element to move to front
 * @returns {T[]} New reordered array, or same array reference if unable to move
 */
export function bringToFront(array, index) {
  if (!Array.isArray(array) || index < 0 || index >= array.length - 1) {
    return array;
  }

  const item = array[index];
  return [...array.slice(0, index), ...array.slice(index + 1), item];
}

/**
 * Moves an item at the given index to the very back of the canvas (index 0).
 *
 * @template T
 * @param {T[]} array - Source array
 * @param {number} index - Index of element to move to back
 * @returns {T[]} New reordered array, or same array reference if unable to move
 */
export function sendToBack(array, index) {
  if (!Array.isArray(array) || index <= 0 || index >= array.length) {
    return array;
  }

  const item = array[index];
  return [item, ...array.slice(0, index), ...array.slice(index + 1)];
}

/**
 * Finds an element by its ID and executes a specified reordering operation on it.
 *
 * @template {{ id: string }} T
 * @param {T[]} array - Array of elements with unique IDs
 * @param {string} id - Target element ID
 * @param {(arr: T[], idx: number) => T[]} reorderFn - Reorder operation function
 * @returns {T[]} Reordered array
 */
export function reorderById(array, id, reorderFn) {
  if (!Array.isArray(array) || !id) return array;
  const index = array.findIndex((el) => el.id === id);
  if (index === -1) return array;
  return reorderFn(array, index);
}
