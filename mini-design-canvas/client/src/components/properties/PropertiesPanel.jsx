import { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore.js';
import { selectSelectedElement, selectElements } from '../../store/selectors.js';
import { PROPERTY_FIELDS_CONFIG } from '../../features/properties/fieldConfig.js';
import { sanitizePropertyValue } from '../../features/properties/propertyUtils.js';
import { EmptyState } from '../ui/index.js';
import { LayersPanel } from './LayersPanel.jsx';
import { PRESET_COLORS } from '../../constants/defaults.js';

/**
 * Dedicated numeric input field with local state to allow typing without jitter,
 * committing on blur or Enter.
 */
function ConfiguredNumberField({ field, value, onCommit }) {
  const [localVal, setLocalVal] = useState(value ?? 0);

  useEffect(() => {
    setLocalVal(value ?? 0);
  }, [value]);

  const commitValue = () => {
    const sanitized = sanitizePropertyValue(field, localVal, value);
    setLocalVal(sanitized);
    if (sanitized !== value) {
      onCommit(field.key, sanitized);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitValue();
      e.target.blur();
    }
  };

  return (
    <div className="prop-number-card">
      <span className="prop-number-label">{field.label}</span>
      <div className="prop-number-input-row">
        <input
          id={`prop-${field.key}`}
          type="number"
          className="prop-number-input"
          value={localVal}
          min={field.min}
          max={field.max}
          step={field.step || 1}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            setLocalVal(isNaN(parsed) ? 0 : parsed);
          }}
          onBlur={commitValue}
          onKeyDown={handleKeyDown}
          aria-label={field.label}
        />
        {field.unit && <span className="prop-number-unit">{field.unit}</span>}
      </div>
    </div>
  );
}

/**
 * Config-driven Properties Inspector Panel with Excalidraw / Stitch Design System.
 * Includes segmented Inspect / Layers tab switcher, coordinate cards,
 * curated 9-swatch palette, and typography controls.
 */
export function PropertiesPanel() {
  const selectedElement = useEditorStore(selectSelectedElement);
  const elements = useEditorStore(selectElements);
  const updateElement = useEditorStore((state) => state.updateElement);

  const [activeTab, setActiveTab] = useState('inspect'); // 'inspect' | 'layers'

  // When selection changes to an element, default to inspect tab
  useEffect(() => {
    if (selectedElement) {
      setActiveTab('inspect');
    }
  }, [selectedElement?.id]);

  if (!selectedElement) {
    return (
      <aside className="properties-sidebar" aria-label="Element Properties Inspector">
        <header className="properties-header">
          <div className="properties-header-title">
            <span>Properties</span>
          </div>
          <div className="properties-tab-switch">
            <button
              type="button"
              className="tab-switch-btn tab-switch-btn--active"
              onClick={() => setActiveTab('inspect')}
            >
              Inspect
            </button>
            <button
              type="button"
              className="tab-switch-btn"
              onClick={() => setActiveTab('layers')}
            >
              Layers ({elements.length})
            </button>
          </div>
        </header>

        <div className="properties-body">
          {activeTab === 'inspect' ? (
            <EmptyState
              title="No Element Selected"
              description="Click any element on the canvas to inspect coordinates, dimensions, rotation, and colors."
            />
          ) : (
            <LayersPanel />
          )}
        </div>
        {activeTab === 'inspect' && <LayersPanel />}
      </aside>
    );
  }

  // Filter fields applicable to the currently selected shape type
  const applicableFields = PROPERTY_FIELDS_CONFIG.filter((field) =>
    field.appliesTo.includes(selectedElement.type),
  );

  const handleFieldChange = (key, rawValue) => {
    const fieldDef = applicableFields.find((f) => f.key === key);
    if (!fieldDef) return;

    const sanitizedValue = sanitizePropertyValue(fieldDef, rawValue, selectedElement[key]);
    updateElement(selectedElement.id, { [key]: sanitizedValue });
  };

  return (
    <aside className="properties-sidebar" aria-label="Element Properties Inspector">
      {/* ── Sticky Header: Title, Type Badge, Tab Switcher ── */}
      <header className="properties-header">
        <div className="properties-header-title">
          <span className="font-semibold">Properties</span>
          <span className="shape-type-pill">{selectedElement.type.toUpperCase()}</span>
        </div>

        <div className="properties-tab-switch">
          <button
            type="button"
            className={`tab-switch-btn ${activeTab === 'inspect' ? 'tab-switch-btn--active' : ''}`}
            onClick={() => setActiveTab('inspect')}
          >
            Inspect
          </button>
          <button
            type="button"
            className={`tab-switch-btn ${activeTab === 'layers' ? 'tab-switch-btn--active' : ''}`}
            onClick={() => setActiveTab('layers')}
          >
            Layers ({elements.length})
          </button>
        </div>
      </header>

      {/* ── Body: Inspect Controls or Layers List ── */}
      <div className="properties-body">
        {activeTab === 'layers' ? (
          <LayersPanel />
        ) : (
          <>
            {/* 1. Coordinates & Size Section */}
            <section className="properties-section">
              <div className="properties-section-header">
                <span className="properties-section-title">Coordinates & Size</span>
                <span className="material-symbols-outlined text-[15px] text-muted">straighten</span>
              </div>

              {/* Coordinates Grid */}
              <div className="properties-grid-2">
                <ConfiguredNumberField
                  field={{ key: 'x', label: 'X', unit: 'px', step: 1 }}
                  value={selectedElement.x}
                  onCommit={handleFieldChange}
                />
                <ConfiguredNumberField
                  field={{ key: 'y', label: 'Y', unit: 'px', step: 1 }}
                  value={selectedElement.y}
                  onCommit={handleFieldChange}
                />
              </div>

              {/* Dimensions: Width & Height for rect, Radius for circle */}
              {selectedElement.type === 'rect' && (
                <div className="properties-grid-2">
                  <ConfiguredNumberField
                    field={{ key: 'width', label: 'Width', unit: 'px', min: 10, max: 5000, step: 1 }}
                    value={selectedElement.width}
                    onCommit={handleFieldChange}
                  />
                  <ConfiguredNumberField
                    field={{ key: 'height', label: 'Height', unit: 'px', min: 10, max: 5000, step: 1 }}
                    value={selectedElement.height}
                    onCommit={handleFieldChange}
                  />
                </div>
              )}

              {selectedElement.type === 'circle' && (
                <ConfiguredNumberField
                  field={{ key: 'radius', label: 'Radius', unit: 'px', min: 5, max: 2500, step: 1 }}
                  value={selectedElement.radius}
                  onCommit={handleFieldChange}
                />
              )}

              {/* Rotation with Reset Icon */}
              <div className="prop-number-card prop-rotation-card">
                <span className="prop-number-label">Rotation</span>
                <div className="prop-rotation-row">
                  <input
                    id="prop-rotation"
                    type="number"
                    className="prop-number-input prop-rotation-input"
                    value={selectedElement.rotation || 0}
                    onChange={(e) => handleFieldChange('rotation', parseFloat(e.target.value) || 0)}
                    aria-label="Rotation degrees"
                  />
                  <span className="prop-number-unit">°</span>
                  <button
                    type="button"
                    className="btn-icon-mini"
                    onClick={() => handleFieldChange('rotation', 0)}
                    title="Reset Rotation to 0°"
                    aria-label="Reset Rotation"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 2. Fill & Color Section with Curated 9-Swatch Palette */}
            <section className="properties-section">
              <div className="properties-section-header">
                <span className="properties-section-title">Fill & Color</span>
                <span className="font-mono text-[12px] font-semibold text-main">
                  {(selectedElement.fill || '#3b82f6').toUpperCase()}
                </span>
              </div>

              {/* Color preview card */}
              <div className="color-preview-card">
                <div
                  className="color-pip"
                  style={{ backgroundColor: selectedElement.fill || '#3b82f6' }}
                  aria-label="Current color swatch"
                />
                <div className="color-preview-info">
                  <input
                    type="text"
                    className="color-hex-text"
                    value={(selectedElement.fill || '#3b82f6').toUpperCase()}
                    onChange={(e) => handleFieldChange('fill', e.target.value)}
                    maxLength={7}
                    aria-label="Hex color code"
                  />
                  <span className="color-mode-subtext">Solid Color</span>
                </div>
              </div>

              {/* Curated 9 Swatches Grid */}
              <div className="swatches-grid-9" role="group" aria-label="Curated color swatches">
                {PRESET_COLORS.slice(0, 9).map((color) => {
                  const isSelected = (selectedElement.fill || '').toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={color}
                      type="button"
                      className={`swatch-circle ${isSelected ? 'swatch-circle--active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleFieldChange('fill', color)}
                      title={color}
                      aria-label={`Select color ${color}`}
                    />
                  );
                })}
              </div>
            </section>

            {/* 4. Typography / Embedded Label Section */}
            {selectedElement.type === 'text' && (
              <section className="properties-section">
                <div className="properties-section-header">
                  <span className="properties-section-title">Typography & Label</span>
                  <span className="material-symbols-outlined text-[15px] text-muted">title</span>
                </div>

                <div className="prop-text-group">
                  <label htmlFor="prop-text" className="prop-number-label">
                    Text Content
                  </label>
                  <input
                    id="prop-text"
                    type="text"
                    className="prop-text-input"
                    value={selectedElement.text || ''}
                    placeholder="Enter text..."
                    onChange={(e) => handleFieldChange('text', e.target.value)}
                  />
                </div>

                <ConfiguredNumberField
                  field={{ key: 'fontSize', label: 'Font Size', unit: 'px', min: 8, max: 200, step: 1 }}
                  value={selectedElement.fontSize || 20}
                  onCommit={handleFieldChange}
                />
              </section>
            )}

            {/* 5. Layers Tree Overview */}
            <div className="pt-2">
              <LayersPanel />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
