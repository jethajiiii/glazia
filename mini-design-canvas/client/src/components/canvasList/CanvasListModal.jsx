import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  Button,
  Spinner,
  ErrorBanner,
  EmptyState,
  useToast,
} from '../ui/index.js';
import { useCanvasActions } from '../../hooks/useCanvasActions.js';
import { formatRelativeTime } from '../../utils/dateUtils.js';

/**
 * Modal dialog for browsing, opening, and deleting saved canvases.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is displayed
 * @param {() => void} props.onClose - Modal close handler
 */
export function CanvasListModal({ isOpen, onClose }) {
  const toast = useToast();
  const { open, remove, listCanvases, canvasId, isDirty, isOpening, isDeleting } =
    useCanvasActions();

  const [canvases, setCanvases] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState(null);
  const [candidateToDelete, setCandidateToDelete] = useState(null);

  const abortRef = useRef(null);

  const fetchCanvases = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setIsLoadingList(true);
    setListError(null);

    try {
      const data = await listCanvases(abortRef.current.signal);
      setCanvases(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setListError(err.message || 'Failed to load canvases');
      }
    } finally {
      setIsLoadingList(false);
    }
  }, [listCanvases]);

  useEffect(() => {
    if (isOpen) {
      fetchCanvases();
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [isOpen, fetchCanvases]);

  const handleOpen = async (canvas) => {
    if (
      isDirty &&
      !window.confirm(
        'You have unsaved changes on the current canvas. Opening another canvas will discard them. Continue?',
      )
    ) {
      return;
    }

    try {
      await open(canvas._id);
      toast.success(`Opened "${canvas.name}"`);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to open canvas');
    }
  };

  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;
    try {
      await remove(candidateToDelete._id);
      toast.info(`Deleted "${candidateToDelete.name}"`);
      setCandidateToDelete(null);
      fetchCanvases();
    } catch (err) {
      toast.error(err.message || 'Failed to delete canvas');
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="My Canvases"
        size="md"
        footer={
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        }
      >
        {isLoadingList && (
          <div className="canvas-modal-loading">
            <Spinner size="md" />
            <span>Loading your designs…</span>
          </div>
        )}

        {listError && !isLoadingList && (
          <ErrorBanner
            message="Could not load saved canvases"
            details={listError}
            onRetry={fetchCanvases}
          />
        )}

        {!isLoadingList && !listError && canvases.length === 0 && (
          <EmptyState
            title="No Saved Canvases"
            description="You haven't saved any designs yet. Click 'Save' in the header to persist your work."
          />
        )}

        {!isLoadingList && !listError && canvases.length > 0 && (
          <ul className="canvas-modal-list" role="listbox" aria-label="Saved Canvases">
            {canvases.map((canvas) => {
              const isCurrent = canvas._id === canvasId;

              return (
                <li
                  key={canvas._id}
                  className={`canvas-modal-item ${isCurrent ? 'canvas-modal-item--active' : ''}`}
                  role="option"
                  aria-selected={isCurrent}
                >
                  <div className="canvas-modal-item-info">
                    <span className="canvas-modal-item-title">
                      {canvas.name}
                      {isCurrent && <span className="canvas-item-badge">Current</span>}
                    </span>
                    <span className="canvas-modal-item-meta">
                      Updated {formatRelativeTime(canvas.updatedAt)}
                    </span>
                  </div>

                  <div className="canvas-modal-item-actions">
                    <Button
                      variant={isCurrent ? 'secondary' : 'primary'}
                      size="sm"
                      isLoading={isOpening}
                      onClick={() => handleOpen(canvas)}
                      aria-label={`Open canvas ${canvas.name}`}
                    >
                      Open
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setCandidateToDelete(canvas)}
                      aria-label={`Delete canvas ${canvas.name}`}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Modal>

      {/* Reusable Delete Confirmation Modal */}
      <Modal
        isOpen={!!candidateToDelete}
        onClose={() => setCandidateToDelete(null)}
        title="Delete Canvas"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setCandidateToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isDeleting}
              onClick={handleConfirmDelete}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <p className="canvas-delete-confirm-text">
          Are you sure you want to permanently delete{' '}
          <strong>&ldquo;{candidateToDelete?.name}&rdquo;</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
