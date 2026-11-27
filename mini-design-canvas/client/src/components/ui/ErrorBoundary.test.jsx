import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary.jsx';

describe('ErrorBoundary', () => {
  it('updates state to hasError: true on getDerivedStateFromError', () => {
    const sampleError = new Error('Component crashed during rendering');
    const nextState = ErrorBoundary.getDerivedStateFromError(sampleError);

    expect(nextState.hasError).toBe(true);
    expect(nextState.error).toBe(sampleError);
  });

  it('initializes with default clean state', () => {
    const boundary = new ErrorBoundary({});

    expect(boundary.state.hasError).toBe(false);
    expect(boundary.state.error).toBe(null);
    expect(boundary.state.errorInfo).toBe(null);
  });

  it('calls onError callback on componentDidCatch', () => {
    const onErrorMock = vi.fn();
    const boundary = new ErrorBoundary({ onError: onErrorMock });
    boundary.setState = vi.fn();

    const error = new Error('Runtime error');
    const info = { componentStack: 'at Component' };

    boundary.componentDidCatch(error, info);

    expect(boundary.setState).toHaveBeenCalledWith({ errorInfo: info });
    expect(onErrorMock).toHaveBeenCalledWith(error, info);
  });

  it('clears error state and triggers onReset when handleReset is called', () => {
    const onResetMock = vi.fn();
    const boundary = new ErrorBoundary({ onReset: onResetMock });

    boundary.state = {
      hasError: true,
      error: new Error('Fatal error'),
      errorInfo: { componentStack: 'stack' },
    };

    boundary.setState = vi.fn((updater) => {
      if (typeof updater === 'object') {
        Object.assign(boundary.state, updater);
      }
    });

    boundary.handleReset();

    expect(boundary.state.hasError).toBe(false);
    expect(boundary.state.error).toBe(null);
    expect(boundary.state.errorInfo).toBe(null);
    expect(onResetMock).toHaveBeenCalledTimes(1);
  });
});
