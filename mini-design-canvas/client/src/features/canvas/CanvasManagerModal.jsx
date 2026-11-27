import { useState, useCallback, useRef } from 'react';
import { Modal, Button, Spinner } from '../../components/ui/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useCanvasPersistence } from './useCanvasPersistence.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { selectCanvasId } from '../../store/selectors.js';
import { CanvasList } from './CanvasList.jsx';

/**
 * Modal dialog that lists all saved canvases.
 * Supports loading a canvas into the editor and deleting canvases.
 * Parent provides isOpen / onClose / onLoaded so it can show toasts.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {(name: string) => void} props.onLoaded   - called after a canvas is loaded
 * @param {(id: string) => void}   props.onDeleted  - called after a canvas is deleted
 */
export function CanvasManagerModal({ isOpen, onClose, onLoaded, onDeleted }) {
  const { load, remove } = useCanvasPersistence();
  const activeCanvasId = useEditorStore(selectCanvasId);
  const resetCanvas = useEditorStore((s) => s.resetCanvas);

  // Track which IDs are in the process of being deleted
  const [deletingIds, setDeletingIds] = useState([]);

  // Refresh trigger: increment to cause CanvasList to re-mount and re-fetch
  const [listKey, setListKey] = useState(0);

  const { run: runLoad, isLoading: isLoadingCanvas } = useAsync();
  const loadingIdRef = useRef(null);

  const handleLoad = useCallback(
    async (id) => {
      loadingIdRef.current = id;
      await runLoad(async () => {
        await load(id);
        onLoaded?.();
        onClose();
      });
      loadingIdRef.current = null;
    },
    [load, onLoaded, onClose, runLoad],
  );

  const handleDelete = useCallback(
    async (id) => {
      setDeletingIds((prev) => [...prev, id]);
      try {
        await remove(id);
        // If the deleted canvas is currently open, reset the editor
        if (id === activeCanvasId) {
          resetCanvas();
        }
        onDeleted?.(id);
        setListKey((k) => k + 1); // force CanvasList refetch
      } finally {
        setDeletingIds((prev) => prev.filter((d) => d !== id));
      }
    },
    [remove, activeCanvasId, resetCanvas, onDeleted],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Saved Canvases"
      size="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {isLoadingCanvas && (
        <div className="canvas-manager-loading">
          <Spinner size="sm" />
          <span>Opening canvas…</span>
        </div>
      )}

      <CanvasList
        key={listKey}
        activeCanvasId={activeCanvasId}
        onLoad={handleLoad}
        onDelete={handleDelete}
        deletingIds={deletingIds}
      />
    </Modal>
  );
}
