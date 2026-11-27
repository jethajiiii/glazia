import { useEffect, useRef } from 'react';
import { canvasApi } from '../../api/canvasApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Spinner, ErrorBanner, EmptyState } from '../../components/ui/index.js';

/**
 * Formats an ISO date string to a human-readable relative or absolute label.
 *
 * @param {string} isoString
 * @returns {string}
 */
function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Displays a list of saved canvases fetched from the backend.
 * Triggers load/delete callbacks chosen by the parent (Header dropdown).
 *
 * @param {object} props
 * @param {string | null}  props.activeCanvasId  - ID of the currently open canvas (highlighted row)
 * @param {(id: string) => void} props.onLoad    - Called when the user clicks a canvas row
 * @param {(id: string) => void} props.onDelete  - Called when the user clicks Delete on a row
 * @param {string[]}             props.deletingIds - IDs currently being deleted (shows spinner)
 */
export function CanvasList({ activeCanvasId, onLoad, onDelete, deletingIds = [] }) {
  const abortRef = useRef(null);

  const { run, data, isLoading, error } = useAsync();

  const fetchList = () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    run(() => canvasApi.listCanvases(abortRef.current.signal));
  };

  // Fetch on mount and expose a refresh mechanism via the returned run fn
  useEffect(() => {
    fetchList();
    return () => abortRef.current?.abort();
  }, []);

  const canvases = data?.data ?? [];

  if (isLoading && canvases.length === 0) {
    return (
      <div className="canvas-list-loading">
        <Spinner size="sm" />
        <span>Loading canvases…</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorBanner
        message="Could not load your saved canvases."
        details={error.message}
        onRetry={fetchList}
      />
    );
  }

  if (canvases.length === 0) {
    return (
      <EmptyState
        icon="🖼️"
        title="No saved canvases"
        description="Create a new canvas and hit Save to persist it here."
      />
    );
  }

  return (
    <ul className="canvas-list" role="listbox" aria-label="Saved canvases">
      {canvases.map((canvas) => {
        const isActive = canvas._id === activeCanvasId;
        const isDeleting = deletingIds.includes(canvas._id);

        return (
          <li
            key={canvas._id}
            className={`canvas-list-item${isActive ? ' canvas-list-item--active' : ''}`}
            role="option"
            aria-selected={isActive}
          >
            <button
              className="canvas-list-item__name"
              onClick={() => onLoad(canvas._id)}
              disabled={isDeleting}
              title={`Open "${canvas.name}"`}
            >
              <span className="canvas-list-item__title">{canvas.name}</span>
              <span className="canvas-list-item__meta">{formatDate(canvas.updatedAt)}</span>
            </button>

            <button
              className="canvas-list-item__delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(canvas._id);
              }}
              disabled={isDeleting}
              aria-label={`Delete canvas "${canvas.name}"`}
              title="Delete"
            >
              {isDeleting ? <Spinner size="xs" /> : '×'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
