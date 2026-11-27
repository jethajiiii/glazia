import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDebouncedFn } from './debounce.js';

describe('debounce utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays callback invocation until delay has elapsed', () => {
    const callback = vi.fn();
    const debounced = createDebouncedFn(callback, 200);

    debounced('hello');
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(199);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledWith('hello');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('resets timer on rapid consecutive calls and only fires once with latest args', () => {
    const callback = vi.fn();
    const debounced = createDebouncedFn(callback, 300);

    debounced('arg1');
    vi.advanceTimersByTime(150);
    debounced('arg2');
    vi.advanceTimersByTime(150);
    debounced('arg3');

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg3');
  });

  it('cancels pending invocation when cancel() is called', () => {
    const callback = vi.fn();
    const debounced = createDebouncedFn(callback, 500);

    debounced('to-be-cancelled');
    vi.advanceTimersByTime(250);

    debounced.cancel();
    vi.advanceTimersByTime(500);

    expect(callback).not.toHaveBeenCalled();
  });
});
