import { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore.js';
import { selectSelectedElement } from '../../store/selectors.js';
import {
  PROPERTY_FIELDS_CONFIG,
  PROPERTY_SECTIONS,
} from '../../features/properties/fieldConfig.js';
import { sanitizePropertyValue } from '../../features/properties/propertyUtils.js';
import { TextInput, NumberInput, ColorInput, EmptyState } from '../ui/index.js';

/**
 * Dedicated number input field handling local typing state and committing on blur or Enter.
 * Prevents intermediate keystrokes from prematurely clamping or breaking state.
 */
function ConfiguredNumberField({ field, value, onCommit }) {
  const [localVal, setLocalVal] = useState(value ?? 0);

  // Sync external changes (e.g. from canvas dragging or selection change)
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
    <NumberInput
      id={`prop-${field.key}`}
      label={field.label}
      value={localVal}
      unit={field.unit}
      min={field.min}
      max={field.max}
      step={field.step}
      onChange={(newNum) => {
        setLocalVal(newNum);
      }}
      onBlur={commitValue}
      onKeyDown={handleKeyDown}
    />
  );
}

/**
 * Config-driven Properties Inspector Panel.
 * Dynamically renders form inputs matching the selected element's type,
 * with instantaneous two-way synchronization with the canvas.
 */
export function PropertiesPanel() {
  const selectedElement = useEditorStore(selectSelectedElement);
  const updateElement = useEditorStore((state) => state.updateElement);

  if (!selectedElement) {
    return (
      <aside className="properties-sidebar" aria-label="Element Properties Inspector">
        <header className="properties-header">
          <span>Properties Inspector</span>
        </header>
        <div className="properties-body">
          <EmptyState
            title="No Element Selected"
            description="Click any element on the canvas to inspect and modify its dimensions, coordinates, and styling."
          />
        </div>
      </aside>
    );
  }

  // Filter fields applicable to the currently selected shape type
  const applicableFields = PROPERTY_FIELDS_CONFIG.filter((field) =>
    field.appliesTo.includes(selectedElement.type),
  );

  // Group fields by visual sections
  const sections = Object.values(PROPERTY_SECTIONS).reduce((acc, sectionName) => {
    const fieldsInSection = applicableFields.filter((f) => f.section === sectionName);
    if (fieldsInSection.length > 0) {
      acc[sectionName] = fieldsInSection;
    }
    return acc;
  }, {});

  const handleFieldChange = (key, rawValue) => {
    const fieldDef = applicableFields.find((f) => f.key === key);
    if (!fieldDef) return;

    const sanitizedValue = sanitizePropertyValue(fieldDef, rawValue, selectedElement[key]);

    updateElement(selectedElement.id, { [key]: sanitizedValue });
  };

  return (
    <aside className="properties-sidebar" aria-label="Element Properties Inspector">
      <header className="properties-header">
        <span>Properties Inspector</span>
        <span className="brand-badge">{selectedElement.type.toUpperCase()}</span>
      </header>

      <div className="properties-body">
        {Object.entries(sections).map(([sectionName, fields]) => {
          // If a section has 2 simple numeric fields (e.g. X & Y, or Width & Height), render in a 2-col grid
          const isTwoColNumeric = fields.length === 2 && fields.every((f) => f.input === 'number');

          return (
            <section key={sectionName} className="properties-section">
              <span className="properties-section-title">{sectionName}</span>

              <div className={isTwoColNumeric ? 'properties-grid-2' : ''}>
                {fields.map((field) => {
                  const currentValue = selectedElement[field.key];

                  if (field.input === 'number') {
                    return (
                      <ConfiguredNumberField
                        key={field.key}
                        field={field}
                        value={currentValue}
                        onCommit={handleFieldChange}
                      />
                    );
                  }

                  if (field.input === 'color') {
                    return (
                      <ColorInput
                        key={field.key}
                        id={`prop-${field.key}`}
                        label={field.label}
                        value={currentValue || '#3b82f6'}
                        onChange={(color) => handleFieldChange(field.key, color)}
                      />
                    );
                  }

                  if (field.input === 'text') {
                    return (
                      <TextInput
                        key={field.key}
                        id={`prop-${field.key}`}
                        label={field.label}
                        value={currentValue || ''}
                        placeholder={field.placeholder}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      />
                    );
                  }

                  return null;
                })}
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
