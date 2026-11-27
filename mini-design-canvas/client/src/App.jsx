import { useState } from 'react';
import {
  Button,
  IconButton,
  Modal,
  TextInput,
  NumberInput,
  ColorInput,
  ErrorBanner,
  ToastProvider,
  useToast,
} from './components/ui/index.js';
import { Toolbar } from './components/toolbar/Toolbar.jsx';
import { CanvasStage } from './components/canvas/CanvasStage.jsx';
import { PropertiesPanel } from './components/properties/PropertiesPanel.jsx';
import { CanvasManagerModal } from './features/canvas/CanvasManagerModal.jsx';
import { useCanvasPersistence } from './features/canvas/useCanvasPersistence.js';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { useAsync } from './hooks/useAsync.js';
import { CANVAS_DEFAULTS } from './constants/defaults.js';
import { ELEMENT_TYPES, ELEMENT_LABELS } from './constants/elementTypes.js';
import { useEditorStore } from './store/useEditorStore.js';
import {
  selectCanvasName,
  selectElements,
  selectIsDirty,
} from './store/selectors.js';

/**
 * Main application shell wired to the Zustand editor store,
 * React Konva canvas stage, config-driven Toolbar, and dynamic Properties Panel.
 */
function CanvasApp() {
  const toast = useToast();

  // Activate global keyboard shortcuts (Delete, Escape, Arrow nudging)
  useKeyboardShortcuts();

  // Zustand Store Subscriptions
  const canvasName = useEditorStore(selectCanvasName);
  const elements = useEditorStore(selectElements);
  const isDirty = useEditorStore(selectIsDirty);

  // Zustand Store Actions
  const addElement = useEditorStore((state) => state.addElement);
  const resetCanvas = useEditorStore((state) => state.resetCanvas);
  const setCanvasName = useEditorStore((state) => state.setCanvasName);

  // Persistence hooks
  const { save } = useCanvasPersistence();
  const { run: runSave, isLoading: isSaving } = useAsync();

  // Local UI-only state
  const [activeTool, setActiveTool] = useState('select');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  // Demo modal inputs
  const [demoText, setDemoText] = useState('Sample text');
  const [demoNumber, setDemoNumber] = useState(42);
  const [demoColor, setDemoColor] = useState('#10b981');
  const [demoLoading, setDemoLoading] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(true);

  const handleToolClick = (toolId) => {
    setActiveTool(toolId);

    if (toolId === 'select') {
      toast.info('Select mode active: click a shape on canvas to select');
      return;
    }

    if (
      toolId === ELEMENT_TYPES.RECT ||
      toolId === ELEMENT_TYPES.CIRCLE ||
      toolId === ELEMENT_TYPES.TEXT
    ) {
      addElement(toolId);
      toast.success(`Added ${ELEMENT_LABELS[toolId]}`);
      setActiveTool('select');
    }
  };

  const handleSave = async () => {
    try {
      const saved = await runSave((signal) => save(signal));
      toast.success(`Design "${saved?.name || canvasName}" saved successfully!`);
    } catch (err) {
      toast.error(err.message || 'Failed to save canvas');
    }
  };

  const handleNewCanvas = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Start a new canvas anyway?')) {
      return;
    }
    resetCanvas();
    toast.info('New blank canvas initialized');
  };

  const handleTriggerToast = (type) => {
    if (type === 'success') toast.success('Operation succeeded cleanly!');
    if (type === 'error') toast.error('Something went wrong. Please check your inputs.');
    if (type === 'info') toast.info('Auto-save is enabled.');
    if (type === 'warning') toast.warning('Canvas dimensions exceed recommended viewport.');
  };

  return (
    <div className="app-shell">
      {/* 1. Top Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="brand-title">
            <span>Mini Design Canvas</span>
            <span className="brand-badge">Konva 2D</span>
          </div>

          <input
            type="text"
            className="canvas-title-input"
            value={canvasName}
            onChange={(e) => setCanvasName(e.target.value)}
            aria-label="Canvas Name"
            placeholder="Untitled Design"
          />

          {isDirty && (
            <span
              className="brand-badge"
              style={{ backgroundColor: 'var(--color-warning-subtle)', color: 'var(--color-warning-text)' }}
            >
              Unsaved Changes
            </span>
          )}
        </div>

        <div className="header-actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsDemoModalOpen(true)}
            aria-label="View UI Primitives Showcase"
          >
            UI Primitives Demo
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsManagerOpen(true)}
          >
            Browse Canvases
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleNewCanvas}
          >
            New Canvas
          </Button>

          <Button
            variant="primary"
            size="sm"
            isLoading={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Saving...' : 'Save Design'}
          </Button>
        </div>
      </header>

      {/* 2. Workspace Body (Toolbar + Canvas Stage + Properties Panel) */}
      <div className="workspace-container">
        {/* Left Toolbar (Config-driven) */}
        <Toolbar activeTool={activeTool} onSelectTool={handleToolClick} />

        {/* Central Canvas Viewport with React Konva Stage */}
        <main className="canvas-viewport" aria-label="Interactive Canvas Viewport">
          <CanvasStage />

          <span className="canvas-meta-badge">
            {CANVAS_DEFAULTS.WIDTH} × {CANVAS_DEFAULTS.HEIGHT} px • {elements.length} element(s)
          </span>
        </main>

        {/* Right Properties Panel (Config-driven, Two-way synced) */}
        <PropertiesPanel />
      </div>

      {/* 3. Saved Canvases Manager Modal */}
      <CanvasManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        onLoaded={() => toast.success('Canvas loaded')}
        onDeleted={() => toast.info('Canvas deleted')}
      />

      {/* 4. Reusable UI Primitives Interactive Demo Modal */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Reusable UI Primitives Showcase"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDemoModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                toast.success('All UI primitives verified successfully!');
                setIsDemoModalOpen(false);
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        {showErrorBanner && (
          <ErrorBanner
            message="Demonstration error alert banner with retry capability"
            details="Error code: ERR_DEMO_SAMPLE"
            onRetry={() => toast.info('Retry triggered')}
            onDismiss={() => setShowErrorBanner(false)}
          />
        )}

        <h4 className="demo-section-title">Buttons & Loading States</h4>
        <div className="demo-row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button
            variant="primary"
            isLoading={demoLoading}
            onClick={() => {
              setDemoLoading(true);
              setTimeout(() => setDemoLoading(false), 1500);
            }}
          >
            {demoLoading ? 'Saving...' : 'Click for Loading State'}
          </Button>
        </div>

        <h4 className="demo-section-title">Icon Buttons</h4>
        <div className="demo-row">
          <IconButton aria-label="Favorite" variant="ghost">★</IconButton>
          <IconButton aria-label="Edit" variant="secondary">✎</IconButton>
          <IconButton aria-label="Checked" variant="primary" isActive>✓</IconButton>
          <IconButton aria-label="Settings" variant="ghost" disabled>⚙</IconButton>
        </div>

        <h4 className="demo-section-title">Form Input Controls</h4>
        <div className="properties-grid-2">
          <TextInput
            id="demo-text-input"
            label="Text Input"
            value={demoText}
            onChange={(e) => setDemoText(e.target.value)}
            helperText="Supports live typing and labels"
          />

          <NumberInput
            id="demo-num-input"
            label="Number Input"
            value={demoNumber}
            unit="px"
            onChange={setDemoNumber}
          />
        </div>

        <ColorInput
          id="demo-color-input"
          label="Color Picker with Palette Swatches"
          value={demoColor}
          onChange={setDemoColor}
        />

        <h4 className="demo-section-title">Toast Trigger System</h4>
        <div className="demo-row">
          <Button variant="outline" size="sm" onClick={() => handleTriggerToast('success')}>
            Success Toast
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleTriggerToast('error')}>
            Error Toast
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleTriggerToast('info')}>
            Info Toast
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleTriggerToast('warning')}>
            Warning Toast
          </Button>
        </div>
      </Modal>
    </div>
  );
}

/**
 * Root App wrapped with ToastProvider
 */
function App() {
  return (
    <ToastProvider>
      <CanvasApp />
    </ToastProvider>
  );
}

export default App;
