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
import { ELEMENT_TYPES, ELEMENT_LABELS } from './constants/elementTypes.js';
import { useEditorStore } from './store/useEditorStore.js';
import {
  selectCanvasName,
  selectElements,
  selectSelectedElement,
  selectIsDirty,
  selectSelectedId,
} from './store/selectors.js';

/**
 * Main application shell wired to the Zustand editor store.
 * The store acts as the single source of truth for elements, selection,
 * and property inspection.
 */
function CanvasApp() {
  const toast = useToast();

  // Zustand Store Subscriptions (minimal slice selectors)
  const canvasName = useEditorStore(selectCanvasName);
  const elements = useEditorStore(selectElements);
  const selectedElement = useEditorStore(selectSelectedElement);
  const selectedId = useEditorStore(selectSelectedId);
  const isDirty = useEditorStore(selectIsDirty);

  // Zustand Store Actions
  const addElement = useEditorStore((state) => state.addElement);
  const updateElement = useEditorStore((state) => state.updateElement);
  const deleteElement = useEditorStore((state) => state.deleteElement);
  const selectElement = useEditorStore((state) => state.selectElement);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const resetCanvas = useEditorStore((state) => state.resetCanvas);
  const setCanvasName = useEditorStore((state) => state.setCanvasName);
  const markSaved = useEditorStore((state) => state.markSaved);

  // Local UI-only state
  const [activeTool, setActiveTool] = useState('select');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Demo modal inputs
  const [demoText, setDemoText] = useState('Sample text');
  const [demoNumber, setDemoNumber] = useState(42);
  const [demoColor, setDemoColor] = useState('#10b981');
  const [demoLoading, setDemoLoading] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(true);

  const handleToolClick = (toolType) => {
    setActiveTool(toolType);

    if (toolType === 'select') {
      toast.info('Select mode active: click an element on canvas to select');
      return;
    }

    if (toolType === ELEMENT_TYPES.RECT || toolType === ELEMENT_TYPES.CIRCLE || toolType === ELEMENT_TYPES.TEXT) {
      const newEl = addElement(toolType);
      toast.success(`Added ${ELEMENT_LABELS[toolType]} (${newEl.id.slice(0, 6)}...)`);
    }
  };

  const handleDelete = () => {
    if (!selectedId) {
      toast.warning('No element selected to delete');
      return;
    }
    deleteElement(selectedId);
    toast.info('Deleted selected element');
  };

  const handleSaveSimulate = () => {
    markSaved();
    toast.success(`Design "${canvasName}" saved (marked clean)`);
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
            value={canvasName}
            onChange={(e) => setCanvasName(e.target.value)}
            aria-label="Canvas Name"
            placeholder="Untitled Design"
          />

          {isDirty && (
            <span
              className="badge"
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
            onClick={() => {
              resetCanvas();
              toast.info('New canvas initialized');
            }}
          >
            New Canvas
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveSimulate}
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
            onClick={() => handleToolClick('select')}
          >
            ⬚
          </IconButton>

          <div className="toolbar-divider" />

          <IconButton
            aria-label="Add Rectangle"
            title="Add Rectangle (R)"
            isActive={activeTool === ELEMENT_TYPES.RECT}
            onClick={() => handleToolClick(ELEMENT_TYPES.RECT)}
          >
            ▭
          </IconButton>

          <IconButton
            aria-label="Add Circle"
            title="Add Circle (C)"
            isActive={activeTool === ELEMENT_TYPES.CIRCLE}
            onClick={() => handleToolClick(ELEMENT_TYPES.CIRCLE)}
          >
            ○
          </IconButton>

          <IconButton
            aria-label="Add Text"
            title="Add Text (T)"
            isActive={activeTool === ELEMENT_TYPES.TEXT}
            onClick={() => handleToolClick(ELEMENT_TYPES.TEXT)}
          >
            T
          </IconButton>

          <div className="toolbar-divider" />

          <IconButton
            aria-label="Delete selected element"
            title="Delete Selected (Delete/Backspace)"
            variant="ghost"
            disabled={!selectedId}
            onClick={handleDelete}
          >
            ✕
          </IconButton>
        </aside>

        {/* Centre Canvas Viewport */}
        <main
          className="canvas-viewport"
          aria-label="Interactive Canvas Viewport"
          onClick={() => clearSelection()}
        >
          <div
            className="canvas-paper-placeholder"
            style={{
              width: `${CANVAS_DEFAULTS.WIDTH}px`,
              height: `${CANVAS_DEFAULTS.HEIGHT}px`,
            }}
            onClick={(e) => {
              // Clicking paper without hitting a shape deselects
              e.stopPropagation();
              clearSelection();
            }}
          >
            <span className="canvas-meta-badge">
              {CANVAS_DEFAULTS.WIDTH} × {CANVAS_DEFAULTS.HEIGHT} px • {elements.length} element(s)
            </span>

            {elements.length === 0 ? (
              <EmptyState
                title="Canvas is Empty"
                description="Use the toolbar on the left to add a Rectangle, Circle, or Text element."
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      addElement(ELEMENT_TYPES.RECT);
                    }}
                  >
                    Add First Rectangle
                  </Button>
                }
              />
            ) : (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                {/* Visual mock representation of elements before Konva integration */}
                {elements.map((el) => {
                  const isSelected = el.id === selectedId;
                  const borderStyle = isSelected
                    ? '2px solid var(--color-primary)'
                    : '1px dashed rgba(0,0,0,0.2)';

                  return (
                    <div
                      key={el.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectElement(el.id);
                      }}
                      style={{
                        position: 'absolute',
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: el.width ? `${el.width}px` : el.radius ? `${el.radius * 2}px` : 'auto',
                        height: el.height ? `${el.height}px` : el.radius ? `${el.radius * 2}px` : 'auto',
                        backgroundColor: el.type !== ELEMENT_TYPES.TEXT ? el.fill : 'transparent',
                        color: el.type === ELEMENT_TYPES.TEXT ? el.fill : undefined,
                        fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
                        borderRadius: el.type === ELEMENT_TYPES.CIRCLE ? '50%' : '2px',
                        transform: `rotate(${el.rotation || 0}deg)`,
                        border: borderStyle,
                        cursor: 'pointer',
                        padding: el.type === ELEMENT_TYPES.TEXT ? '4px' : 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        userSelect: 'none',
                        boxShadow: isSelected ? '0 0 0 3px rgba(37,99,235,0.2)' : 'none',
                      }}
                      title={`${ELEMENT_LABELS[el.type]} (${el.id.slice(0, 6)})`}
                    >
                      {el.type === ELEMENT_TYPES.TEXT && el.text}
                    </div>
                  );
                })}
              </div>
            )}
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
                      onChange={(x) => updateElement(selectedElement.id, { x })}
                    />
                    <NumberInput
                      id="prop-y"
                      label="Y"
                      value={selectedElement.y}
                      unit="px"
                      onChange={(y) => updateElement(selectedElement.id, { y })}
                    />
                  </div>
                </section>

                <section className="properties-section">
                  <span className="properties-section-title">Dimensions</span>
                  {selectedElement.type === ELEMENT_TYPES.RECT && (
                    <div className="properties-grid-2">
                      <NumberInput
                        id="prop-w"
                        label="Width"
                        value={selectedElement.width}
                        unit="px"
                        min={10}
                        onChange={(width) => updateElement(selectedElement.id, { width })}
                      />
                      <NumberInput
                        id="prop-h"
                        label="Height"
                        value={selectedElement.height}
                        unit="px"
                        min={10}
                        onChange={(height) => updateElement(selectedElement.id, { height })}
                      />
                    </div>
                  )}

                  {selectedElement.type === ELEMENT_TYPES.CIRCLE && (
                    <NumberInput
                      id="prop-radius"
                      label="Radius"
                      value={selectedElement.radius}
                      unit="px"
                      min={5}
                      onChange={(radius) => updateElement(selectedElement.id, { radius })}
                    />
                  )}

                  {selectedElement.type === ELEMENT_TYPES.TEXT && (
                    <>
                      <TextInput
                        id="prop-text"
                        label="Text Content"
                        value={selectedElement.text || ''}
                        onChange={(e) =>
                          updateElement(selectedElement.id, { text: e.target.value })
                        }
                      />
                      <NumberInput
                        id="prop-fontSize"
                        label="Font Size"
                        value={selectedElement.fontSize || 20}
                        unit="px"
                        min={8}
                        max={160}
                        onChange={(fontSize) => updateElement(selectedElement.id, { fontSize })}
                      />
                    </>
                  )}
                </section>

                <section className="properties-section">
                  <span className="properties-section-title">Appearance</span>
                  <NumberInput
                    id="prop-rot"
                    label="Rotation"
                    value={selectedElement.rotation || 0}
                    unit="°"
                    min={-360}
                    max={360}
                    onChange={(rotation) =>
                      updateElement(selectedElement.id, { rotation })
                    }
                  />

                  <ColorInput
                    id="prop-fill"
                    label="Fill Color"
                    value={selectedElement.fill}
                    onChange={(fill) => updateElement(selectedElement.id, { fill })}
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
