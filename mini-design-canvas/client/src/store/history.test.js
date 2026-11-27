import { describe, it, expect } from 'vitest';
import {
  createHistoryState,
  pushSnapshot,
  undoHistory,
  redoHistory,
  canUndo,
  canRedo,
  MAX_HISTORY_DEPTH,
} from './history.js';

describe('history management module', () => {
  it('creates an empty initial history state', () => {
    const history = createHistoryState();
    expect(history.past).toEqual([]);
    expect(history.future).toEqual([]);
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(false);
  });

  it('pushes snapshots and clears future stack', () => {
    let history = createHistoryState();
    history = pushSnapshot(history, { elements: [{ id: '1' }] });

    expect(history.past.length).toBe(1);
    expect(history.future.length).toBe(0);
    expect(canUndo(history)).toBe(true);
    expect(canRedo(history)).toBe(false);
  });

  it('enforces maximum history depth by trimming oldest entries', () => {
    let history = createHistoryState();
    const customDepth = 3;

    // Verify the exported constant is a positive integer
    expect(MAX_HISTORY_DEPTH).toBeGreaterThan(0);
    expect(Number.isInteger(MAX_HISTORY_DEPTH)).toBe(true);

    for (let i = 1; i <= 5; i++) {
      history = pushSnapshot(history, { count: i }, customDepth);
    }

    expect(history.past.length).toBe(customDepth);
    expect(history.past).toEqual([{ count: 3 }, { count: 4 }, { count: 5 }]);
  });

  it('supports undo operation restoring prior state and populating future', () => {
    let history = createHistoryState();
    history = pushSnapshot(history, { val: 'A' });
    history = pushSnapshot(history, { val: 'B' });

    const current = { val: 'C' };
    const { history: nextHistory, restored } = undoHistory(history, current);

    expect(restored).toEqual({ val: 'B' });
    expect(nextHistory.past).toEqual([{ val: 'A' }]);
    expect(nextHistory.future).toEqual([{ val: 'C' }]);
    expect(canUndo(nextHistory)).toBe(true);
    expect(canRedo(nextHistory)).toBe(true);
  });

  it('returns null restored when attempting to undo with empty past', () => {
    const history = createHistoryState();
    const { history: nextHistory, restored } = undoHistory(history, { val: 'Current' });

    expect(restored).toBe(null);
    expect(nextHistory).toBe(history);
  });

  it('supports redo operation restoring future state and populating past', () => {
    let history = createHistoryState();
    history = pushSnapshot(history, { val: 'A' });

    const current = { val: 'B' };
    const { history: afterUndo } = undoHistory(history, current);

    const { history: afterRedo, restored } = redoHistory(afterUndo, { val: 'A' });

    expect(restored).toEqual({ val: 'B' });
    expect(afterRedo.future).toEqual([]);
    expect(afterRedo.past).toEqual([{ val: 'A' }]);
    expect(canUndo(afterRedo)).toBe(true);
    expect(canRedo(afterRedo)).toBe(false);
  });

  it('returns null restored when attempting to redo with empty future', () => {
    const history = createHistoryState();
    const { history: nextHistory, restored } = redoHistory(history, { val: 'Current' });

    expect(restored).toBe(null);
    expect(nextHistory).toBe(history);
  });

  it('clears future stack when a new action is performed after undo', () => {
    let history = createHistoryState();
    history = pushSnapshot(history, { val: 'Step 1' });
    history = pushSnapshot(history, { val: 'Step 2' });

    // Undo back to Step 2
    const { history: afterUndo } = undoHistory(history, { val: 'Step 3' });
    expect(afterUndo.future.length).toBe(1);

    // Branch to a new action
    const branched = pushSnapshot(afterUndo, { val: 'Branched Step' });
    expect(branched.future).toEqual([]);
    expect(branched.past.length).toBe(2);
  });
});
