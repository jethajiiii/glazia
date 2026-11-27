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
import { Button, IconButton, GlaziaLogo, useToast } from '../ui/index.js';

/**
 * Top application navigation header — Excalidraw / Stitch Whiteboard Design.
 * Features the Glazia architectural glass logo, editable canvas title with caret,
 * cloud sync status indicator, undo/redo controls, collaborator badges,
 * share/export, and canvas management buttons.
 *
 * @param {object} props
 * @param {() => void} props.onOpenMyCanvases - Trigger for My Canvases modal
 * @param {() => void} props.onOpenNewCanvas - Trigger for New Canvas modal
 * @param {() => void} [props.onOpenDemo] - Trigger for UI Primitives demo
 * @param {() => void} [props.onExportPng] - Direct export canvas trigger
 */
export function Header({ onOpenMyCanvases, onOpenNewCanvas, onOpenDemo, onExportPng }) {
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
        toast.success(`Design "${saved.name || canvasName}" saved to Glazia Cloud!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save canvas');
    }
  };

  return (
    <header className="app-header" aria-label="Editor Header">
      {/* ── Left: Brand, Canvas Title, Cloud Sync Badge ── */}
      <div className="header-left">
        <div className="brand-header-wrapper" title="Glazia Canvas Studio">
          <GlaziaLogo size={28} />
        </div>

        <div className="header-v-divider" />

        <div className="canvas-title-wrapper">
          <input
            type="text"
            id="canvas-name-input"
            className="canvas-title-input"
            value={canvasName}
            onChange={(e) => setCanvasName(e.target.value)}
            aria-label="Design Title"
            placeholder="Untitled Design"
          />
          <span className="material-symbols-outlined title-caret-icon" aria-hidden="true">
            unfold_more
          </span>
        </div>

        {/* Dynamic Cloud Sync Status Pill */}
        <div className="cloud-save-badge-wrapper">
          {(isSaving || autoSaveStatus === 'saving') && (
            <div className="cloud-save-badge cloud-save-badge--saving" role="status" aria-label="Saving to cloud">
              <span className="status-dot dot-blue" />
              <span>Saving to Glazia Cloud…</span>
            </div>
          )}

          {!isSaving && autoSaveStatus === 'saved' && !isDirty && (
            <div className="cloud-save-badge cloud-save-badge--saved" role="status" aria-label="Saved to cloud">
              <span className="status-dot dot-green" />
              <span>Saved to Glazia Cloud</span>
            </div>
          )}

          {!isSaving && isDirty && (
            <div className="cloud-save-badge cloud-save-badge--warning" role="status" aria-label="Unsaved changes">
              <span className="status-dot dot-amber" />
              <span>Unsaved Changes</span>
            </div>
          )}

          {!isSaving && !isDirty && autoSaveStatus !== 'saved' && (
            <div className="cloud-save-badge cloud-save-badge--saved" role="status" aria-label="Cloud sync active">
              <span className="status-dot dot-green" />
              <span>Saved to Glazia Cloud</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Undo/Redo, Collaborators, Share, Canvas Management ── */}
      <div className="header-actions">
        {/* Undo / Redo Segmented Capsule */}
        <div className="header-segmented-group" role="group" aria-label="History Navigation">
          <IconButton
            aria-label="Undo last action"
            title="Undo (Ctrl+Z)"
            variant="ghost"
            disabled={!canUndo}
            onClick={undo}
            className="header-segmented-btn"
          >
            <span className="material-symbols-outlined text-[18px]">undo</span>
          </IconButton>

          <IconButton
            aria-label="Redo last undone action"
            title="Redo (Ctrl+Shift+Z / Ctrl+Y)"
            variant="ghost"
            disabled={!canRedo}
            onClick={redo}
            className="header-segmented-btn"
          >
            <span className="material-symbols-outlined text-[18px]">redo</span>
          </IconButton>
        </div>

        {/* Auto-save Toggle Chip */}
        <button
          type="button"
          className={`header-chip-btn ${isAutoSaveEnabled ? 'header-chip-btn--active' : ''}`}
          onClick={toggleAutoSave}
          title={`Auto-save is ${isAutoSaveEnabled ? 'ON' : 'OFF'}. Click to toggle.`}
          aria-label={`Toggle auto-save, currently ${isAutoSaveEnabled ? 'enabled' : 'disabled'}`}
        >
          <span className={`chip-dot ${isAutoSaveEnabled ? 'dot-green' : 'dot-muted'}`} />
          <span>Auto-Save: {isAutoSaveEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Collaborators Avatar Stack */}
        <div className="collaborator-avatar-stack" title="Collaborators on board">
          <span className="collaborator-avatar avatar-mk">MK</span>
          <span className="collaborator-avatar avatar-al">AL</span>
        </div>

        {/* Share / Export Action Button */}
        {onExportPng && (
          <button
            type="button"
            className="btn-share-gradient"
            onClick={onExportPng}
            title="Export / Share Canvas (PNG)"
            aria-label="Export or Share Canvas"
          >
            <span className="material-symbols-outlined text-[16px]">ios_share</span>
            <span>Share</span>
          </button>
        )}

        {/* Canvas Management Modals */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenMyCanvases}
          aria-label="Open My Canvases"
          className="header-nav-btn"
        >
          My Canvases
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenNewCanvas}
          aria-label="Create New Canvas"
          className="header-nav-btn"
        >
          New Canvas
        </Button>

        {/* Primary Save Button */}
        <Button
          variant="primary"
          size="sm"
          isLoading={isSaving}
          disabled={isSaveDisabled}
          onClick={handleSave}
          aria-label="Save Canvas Design"
          className="btn-save-primary"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </Button>

        {onOpenDemo && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenDemo}
            aria-label="View UI Primitives Showcase"
            className="header-demo-btn"
          >
            Demo
          </Button>
        )}

        {/* User Profile Pill */}
        <div className="header-user-avatar" title="Glazia User">
          <span className="material-symbols-outlined text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
}
