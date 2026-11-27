import { useState } from 'react';
import {
  Button,
  IconButton,
  Modal,
  TextInput,
  NumberInput,
  ColorInput,
  EmptyState,
  ErrorBanner,
  ToastProvider,
  useToast,
} from './components/ui/index.js';
import { CANVAS_DEFAULTS } from './constants/defaults.js';
import { ELEMENT_TYPES } from './constants/elementTypes.js';

/**
 * Main application shell containing Header, Toolbar, Canvas Viewport,
 * and Properties Panel, plus a UI Primitives Demo modal.
 */
function CanvasApp() {
  const toast = useToast();

  // App layout states
  const [canvasTitle, setCanvasTitle] = useState(CANVAS_DEFAULTS.NAME);
  const [activeTool, setActiveTool] = useState('select');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Demo interactive states for Properties Panel placeholder
  const [selectedElement, setSelectedElement] = useState({
    id: 'demo-rect-1',
    type: ELEMENT_TYPES.RECT,
    x: 150,
    y: 120,
    width: 200,
    height: 120,
    rotation: 0,
    fill: '#3b82f6',
  });

  // Demo modal inputs
  const [demoText, setDemoText] = useState('Sample text');
  const [demoNumber, setDemoNumber] = useState(42);
  const [demoColor, setDemoColor] = useState('#10b981');
  const [demoLoading, setDemoLoading] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(true);

  const handleToolSelect = (tool) => {
    setActiveTool(tool);
    toast.info(`Selected tool: ${tool.toUpperCase()}`);
  };

  const handleTriggerToast = (type) => {
    if (type === 'success') toast.success('Operation succeeded cleanly!');
    if (type === 'error') toast.error('Something went wrong. Please check your inputs.');
    if (type === 'info') toast.info('Auto-save is enabled.');
    if (type === 'warning') toast.warning('Canvas dimensions exceed recommended viewport.');
  };

  return (
    <div className="app-shell">
      {/* 1. Header (Top) */}
      <header className="app-header">
        <div className="header-left">
          <div className="brand-title">
            <span>Mini Design Canvas</span>
            <span className="brand-badge">Editor</span>
          </div>

          <input
            type="text"
            className="canvas-title-input"
            value={canvasTitle}
            onChange={(e) => setCanvasTitle(e.target.value)}
            aria-label="Canvas Name"
            placeholder="Untitled Design"
          />
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
            onClick={() => toast.info('New canvas action')}
          >
            New Canvas
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.success(`Saved "${canvasTitle}" successfully`)}
          >
            Save Design
          </Button>
        </div>
      </header>

      {/* 2. Workspace Body (Toolbar + Canvas Area + Properties Panel) */}
      <div className="workspace-container">
        {/* Left Toolbar */}
        <aside className="toolbar-sidebar" aria-label="Editor Tools">
          <IconButton
            aria-label="Select tool"
            title="Select & Move (V)"
            isActive={activeTool === 'select'}
            onClick={() => handleToolSelect('select')}
          >
            ⬚
          </IconButton>

          <div className="toolbar-divider" />

          <IconButton
            aria-label="Add Rectangle"
            title="Rectangle Tool (R)"
            isActive={activeTool === 'rect'}
            onClick={() => handleToolSelect('rect')}
          >
            ▭
          </IconButton>

          <IconButton
            aria-label="Add Circle"
            title="Circle Tool (C)"
            isActive={activeTool === 'circle'}
            onClick={() => handleToolSelect('circle')}
          >
            ○
          </IconButton>

          <IconButton
            aria-label="Add Text"
            title="Text Tool (T)"
            isActive={activeTool === 'text'}
            onClick={() => handleToolSelect('text')}
          >
            T
          </IconButton>

          <div className="toolbar-divider" />

          <IconButton
            aria-label="Delete selected element"
            title="Delete Selected"
            variant="ghost"
            onClick={() => {
              setSelectedElement(null);
              toast.warning('Element deleted from canvas');
            }}
          >
            ✕
          </IconButton>
        </aside>

        {/* Centre Canvas Viewport */}
        <main className="canvas-viewport" aria-label="Interactive Canvas Viewport">
          <div
            className="canvas-paper-placeholder"
            style={{
              width: `${CANVAS_DEFAULTS.WIDTH}px`,
              height: `${CANVAS_DEFAULTS.HEIGHT}px`,
            }}
          >
            <span className="canvas-meta-badge">
              {CANVAS_DEFAULTS.WIDTH} × {CANVAS_DEFAULTS.HEIGHT} px
            </span>

            <EmptyState
              title="Interactive Canvas Area"
              description="Konva canvas stage mounts here. Use the toolbar on the left to add shapes, and edit properties on the right."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedElement({
                      id: 'demo-rect-1',
                      type: ELEMENT_TYPES.RECT,
                      x: 100,
                      y: 100,
                      width: 180,
                      height: 100,
                      rotation: 0,
                      fill: '#3b82f6',
                    })
                  }
                >
                  Simulate Element Selection
                </Button>
              }
            />
          </div>
        </main>

        {/* Right Properties Panel */}
        <aside className="properties-sidebar" aria-label="Element Properties Inspector">
          <header className="properties-header">
            <span>Properties Inspector</span>
            {selectedElement && (
              <span className="brand-badge">{selectedElement.type.toUpperCase()}</span>
            )}
          </header>

          <div className="properties-body">
            {selectedElement ? (
              <>
                <section className="properties-section">
                  <span className="properties-section-title">Coordinates</span>
                  <div className="properties-grid-2">
                    <NumberInput
                      id="prop-x"
                      label="X"
                      value={selectedElement.x}
                      unit="px"
                      onChange={(x) => setSelectedElement((prev) => ({ ...prev, x }))}
                    />
                    <NumberInput
                      id="prop-y"
                      label="Y"
                      value={selectedElement.y}
                      unit="px"
                      onChange={(y) => setSelectedElement((prev) => ({ ...prev, y }))}
                    />
                  </div>
                </section>

                <section className="properties-section">
                  <span className="properties-section-title">Dimensions</span>
                  <div className="properties-grid-2">
                    <NumberInput
                      id="prop-w"
                      label="Width"
                      value={selectedElement.width}
                      unit="px"
                      min={10}
                      onChange={(width) => setSelectedElement((prev) => ({ ...prev, width }))}
                    />
                    <NumberInput
                      id="prop-h"
                      label="Height"
                      value={selectedElement.height}
                      unit="px"
                      min={10}
                      onChange={(height) => setSelectedElement((prev) => ({ ...prev, height }))}
                    />
                  </div>
                </section>

                <section className="properties-section">
                  <span className="properties-section-title">Appearance</span>
                  <NumberInput
                    id="prop-rot"
                    label="Rotation"
                    value={selectedElement.rotation}
                    unit="°"
                    min={-360}
                    max={360}
                    onChange={(rotation) => setSelectedElement((prev) => ({ ...prev, rotation }))}
                  />

                  <ColorInput
                    id="prop-fill"
                    label="Fill Color"
                    value={selectedElement.fill}
                    onChange={(fill) => setSelectedElement((prev) => ({ ...prev, fill }))}
                  />
                </section>
              </>
            ) : (
              <EmptyState
                title="No Element Selected"
                description="Click any element on the canvas to inspect and modify its dimensions, coordinates, and styling."
              />
            )}
          </div>
        </aside>
      </div>

      {/* 3. Reusable UI Primitives Interactive Demo Modal */}
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
