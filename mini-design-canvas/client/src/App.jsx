import { useState, useRef } from 'react';
import { useZoomPan } from './hooks/useZoomPan.js';
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
  ErrorBoundary,
} from './components/ui/index.js';
import { Header } from './components/header/Header.jsx';
import { Toolbar } from './components/toolbar/Toolbar.jsx';
import { CanvasStage } from './components/canvas/CanvasStage.jsx';
import { PropertiesPanel } from './components/properties/PropertiesPanel.jsx';
import { CanvasListModal } from './components/canvasList/CanvasListModal.jsx';
import { NewCanvasModal } from './components/canvasList/NewCanvasModal.jsx';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { useBeforeUnload } from './hooks/useBeforeUnload.js';
import { CANVAS_DEFAULTS } from './constants/defaults.js';
import { ELEMENT_TYPES, ELEMENT_LABELS } from './constants/elementTypes.js';
import { useEditorStore } from './store/useEditorStore.js';
import { selectElements, selectIsDirty, selectCanvasName } from './store/selectors.js';
import { exportStageToPng } from './utils/exportStage.js';

/**
 * Main application shell wired to the Zustand editor store,
 * React Konva canvas stage, Header with persistence controls, and Properties Panel.
 */
function CanvasApp() {
  const toast = useToast();
  const stageRef = useRef(null);

  // Activate global keyboard shortcuts (Delete, Escape, Arrow nudging, Undo/Redo)
  useKeyboardShortcuts();

  // Store subscriptions
  const elements = useEditorStore(selectElements);
  const isDirty = useEditorStore(selectIsDirty);
  const canvasName = useEditorStore(selectCanvasName);

  // Store actions
  const addElement = useEditorStore((state) => state.addElement);

  // Guard against accidental page refresh/closing when dirty
  useBeforeUnload(isDirty);

  // Zoom and pan via useZoomPan hook
  const {
    scale,
    stagePos,
    zoomPercent,
    handleWheel,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    resetZoom,
    zoomIn,
    zoomOut,
  } = useZoomPan(stageRef);

  // State: tools and grid
  const [activeTool, setActiveTool] = useState('select');
  const [isGridEnabled, setIsGridEnabled] = useState(false);

  // Modal display states
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isCanvasListOpen, setIsCanvasListOpen] = useState(false);
  const [isNewCanvasOpen, setIsNewCanvasOpen] = useState(false);

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

  const handleExportPng = () => {
    try {
      exportStageToPng(stageRef.current, canvasName);
      toast.success('Canvas exported as PNG');
    } catch (err) {
      toast.error(err.message || 'Failed to export PNG');
    }
  };

  const handleToggleGrid = () => {
    setIsGridEnabled((prev) => {
      const next = !prev;
      toast.info(next ? 'Grid & Snap enabled' : 'Grid & Snap disabled');
      return next;
    });
  };

  const handleTriggerToast = (type) => {
    if (type === 'success') toast.success('Operation succeeded cleanly!');
    if (type === 'error') toast.error('Something went wrong. Please check your inputs.');
    if (type === 'info') toast.info('Auto-save is enabled.');
    if (type === 'warning') toast.warning('Canvas dimensions exceed recommended viewport.');
  };

  return (
    <div className="app-shell">
      {/* 1. Header with Persistence & Auto-Save Controls */}
      <Header
        onOpenMyCanvases={() => setIsCanvasListOpen(true)}
        onOpenNewCanvas={() => setIsNewCanvasOpen(true)}
        onOpenDemo={() => setIsDemoModalOpen(true)}
      />

      {/* 2. Workspace Body (Toolbar + Canvas Stage + Properties Panel) */}
      <div className="workspace-container">
        {/* Left Toolbar (Config-driven, Layer & Export & Grid tools) */}
        <Toolbar
          activeTool={activeTool}
          onSelectTool={handleToolClick}
          isGridEnabled={isGridEnabled}
          onToggleGrid={handleToggleGrid}
          onExportPng={handleExportPng}
        />

        {/* Central Canvas Viewport with React Konva Stage */}
        <main className="canvas-viewport" aria-label="Interactive Canvas Viewport">
          <CanvasStage
            stageRef={stageRef}
            showGrid={isGridEnabled}
            snapToGrid={isGridEnabled}
            scale={scale}
            stagePos={stagePos}
            onWheel={handleWheel}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
          />

          <span className="canvas-meta-badge">
            {CANVAS_DEFAULTS.WIDTH} × {CANVAS_DEFAULTS.HEIGHT} px • {elements.length} element(s)
            {isGridEnabled && ' • Grid (20px)'}
          </span>

          {/* Floating Zoom & Pan Controls */}
          <div className="canvas-zoom-controls" role="toolbar" aria-label="Zoom and Pan Controls">
            <button
              type="button"
              className="canvas-zoom-btn"
              onClick={zoomOut}
              aria-label="Zoom Out"
              title="Zoom Out (Ctrl+-)"
            >
              −
            </button>
            <button
              type="button"
              className="canvas-zoom-reset"
              onClick={resetZoom}
              aria-label="Reset Zoom"
              title="Reset Zoom to 100% (Ctrl+0)"
            >
              {zoomPercent}%
            </button>
            <button
              type="button"
              className="canvas-zoom-btn"
              onClick={zoomIn}
              aria-label="Zoom In"
              title="Zoom In (Ctrl+=)"
            >
              +
            </button>
          </div>
        </main>

        {/* Right Properties Panel (Config-driven, Two-way synced) */}
        <PropertiesPanel />
      </div>

      {/* 3. My Canvases Modal */}
      <CanvasListModal
        isOpen={isCanvasListOpen}
        onClose={() => setIsCanvasListOpen(false)}
      />

      {/* 4. New Canvas Modal */}
      <NewCanvasModal
        isOpen={isNewCanvasOpen}
        onClose={() => setIsNewCanvasOpen(false)}
      />

      {/* 5. Reusable UI Primitives Interactive Demo Modal */}
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
 * Root App wrapped with ErrorBoundary and ToastProvider
 */
function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <CanvasApp />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
