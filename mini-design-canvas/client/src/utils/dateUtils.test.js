import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatRelativeTime } from './dateUtils.js';

describe('dateUtils - formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string for null, undefined, or empty values', () => {
    expect(formatRelativeTime(null)).toBe('');
    expect(formatRelativeTime(undefined)).toBe('');
    expect(formatRelativeTime('')).toBe('');
    expect(formatRelativeTime('invalid-date-string')).toBe('');
  });

  it('formats recent timestamps as "just now"', () => {
    const now = new Date('2026-11-27T12:00:00Z');
    vi.setSystemTime(now);

    const fiveSecondsAgo = new Date('2026-11-27T11:59:55Z');
    expect(formatRelativeTime(fiveSecondsAgo.toISOString())).toBe('just now');
  });

  it('formats minutes ago correctly', () => {
    const now = new Date('2026-11-27T12:00:00Z');
    vi.setSystemTime(now);

    const tenMinutesAgo = new Date('2026-11-27T11:50:00Z');
    expect(formatRelativeTime(tenMinutesAgo.toISOString())).toBe('10m ago');
  });

  it('formats hours ago correctly', () => {
    const now = new Date('2026-11-27T12:00:00Z');
    vi.setSystemTime(now);

    const threeHoursAgo = new Date('2026-11-27T09:00:00Z');
    expect(formatRelativeTime(threeHoursAgo.toISOString())).toBe('3h ago');
  });

  it('formats yesterday correctly', () => {
    const now = new Date('2026-11-27T12:00:00Z');
    vi.setSystemTime(now);

    const yesterday = new Date('2026-11-26T10:00:00Z');
    expect(formatRelativeTime(yesterday.toISOString())).toBe('yesterday');
  });

  it('formats multiple days ago correctly', () => {
    const now = new Date('2026-11-27T12:00:00Z');
    vi.setSystemTime(now);

    const threeDaysAgo = new Date('2026-11-24T12:00:00Z');
    expect(formatRelativeTime(threeDaysAgo.toISOString())).toBe('3d ago');
  });
});
