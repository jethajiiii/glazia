import { useEditorStore } from '../../store/useEditorStore.js';
import {
  selectCanvasId,
  selectCanvasName,
  selectIsDirty,
  selectCanUndo,
  selectCanRedo,
} from '../../store/selectors.js';
import { useCanvasActions } from '../../hooks/useCanvasActions.js';
import { useAutoSave } from '../../hooks/useAutoSave.js';
import { Button, IconButton, useToast } from '../ui/index.js';

/**
 * Top application navigation header.
 * Displays editable design title, auto-save status indicator, save action,
 * and entry points to Canvas browsing and creation modals.
 *
 * @param {object} props
 * @param {() => void} props.onOpenMyCanvases - Trigger for My Canvases modal
 * @param {() => void} props.onOpenNewCanvas - Trigger for New Canvas modal
 * @param {() => void} [props.onOpenDemo] - Trigger for UI Primitives demo
 */
export function Header({ onOpenMyCanvases, onOpenNewCanvas, onOpenDemo }) {
  const toast = useToast();

  const canvasId = useEditorStore(selectCanvasId);
  const canvasName = useEditorStore(selectCanvasName);
  const isDirty = useEditorStore(selectIsDirty);
  const canUndo = useEditorStore(selectCanUndo);
  const canRedo = useEditorStore(selectCanRedo);
  const setCanvasName = useEditorStore((state) => state.setCanvasName);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  const { save, isSaving } = useCanvasActions();
  const {
    status: autoSaveStatus,
    isEnabled: isAutoSaveEnabled,
    toggle: toggleAutoSave,
  } = useAutoSave(save);

  // Disabled when already saved and not dirty
  const isSaveDisabled = (!isDirty && canvasId !== null) || isSaving;

  const handleSave = async () => {
    try {
      const saved = await save();
      if (saved) {
        toast.success(`Design "${saved.name || canvasName}" saved successfully!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save canvas');
    }
  };

  return (
    <header className="app-header" aria-label="Editor Header">
      <div className="header-left">
        <div className="brand-title">
          <span>Mini Design Canvas</span>
          <span className="brand-badge">Konva 2D</span>
        </div>

        <input
          type="text"
          id="canvas-name-input"
          className="canvas-title-input"
          value={canvasName}
          onChange={(e) => setCanvasName(e.target.value)}
          aria-label="Design Title"
          placeholder="Untitled Design"
        />

        {(isSaving || autoSaveStatus === 'saving') && (
          <span
            className="brand-badge brand-badge--info"
            role="status"
            aria-label="Auto-saving changes"
          >
            Saving…
          </span>
        )}

        {!isSaving && autoSaveStatus === 'saved' && (
          <span
            className="brand-badge brand-badge--success"
            role="status"
            aria-label="Changes saved"
          >
            Saved
          </span>
        )}

        {!isSaving && autoSaveStatus !== 'saved' && isDirty && (
          <span
            className="brand-badge brand-badge--warning"
            role="status"
            aria-label="Unsaved Changes Indicator"
          >
            Unsaved Changes
          </span>
        )}
      </div>

      <div className="header-actions">
        <IconButton
          aria-label="Undo last action"
          title="Undo (Ctrl+Z)"
          variant="ghost"
          disabled={!canUndo}
          onClick={undo}
        >
          ↩
        </IconButton>

        <IconButton
          aria-label="Redo last undone action"
          title="Redo (Ctrl+Shift+Z)"
          variant="ghost"
          disabled={!canRedo}
          onClick={redo}
        >
          ↪
        </IconButton>

        <Button
          variant={isAutoSaveEnabled ? 'secondary' : 'ghost'}
          size="sm"
          onClick={toggleAutoSave}
          aria-label={`Toggle auto-save, currently ${isAutoSaveEnabled ? 'enabled' : 'disabled'}`}
          title={`Auto-save is ${isAutoSaveEnabled ? 'ON' : 'OFF'}. Click to toggle.`}
        >
          Auto-Save: {isAutoSaveEnabled ? 'ON' : 'OFF'}
        </Button>

        {onOpenDemo && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenDemo}
            aria-label="View UI Primitives Showcase"
          >
            UI Demo
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenMyCanvases}
          aria-label="Open My Canvases"
        >
          My Canvases
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenNewCanvas}
          aria-label="Create New Canvas"
        >
          New Canvas
        </Button>

        <Button
          variant="primary"
          size="sm"
          isLoading={isSaving}
          disabled={isSaveDisabled}
          onClick={handleSave}
          aria-label="Save Canvas Design"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </header>
  );
}
