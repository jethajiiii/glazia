import { PRESET_COLORS } from '../../constants/defaults.js';

/**
 * Accessible color input with native picker, hex text display, and preset swatches.
 *
 * @param {{
 *   label: string,
 *   id: string,
 *   value: string,
 *   onChange: (color: string) => void,
 *   className?: string
 * }} props
 */
export function ColorInput({
  label,
  id,
  value = '#3b82f6',
  onChange,
  disabled = false,
  className = '',
}) {
  const handleHexChange = (e) => {
    const val = e.target.value;
    onChange(val);
  };

  return (
    <div className={`color-input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}

      <div className="color-picker-row">
        <div className="color-swatch-wrapper" style={{ backgroundColor: value }}>
          <input
            type="color"
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="color-native-input"
            aria-label={`${label} color picker`}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={handleHexChange}
          disabled={disabled}
          maxLength={7}
          className="input-field color-hex-field"
          placeholder="#000000"
          aria-label={`${label} hex code`}
        />
      </div>

      <div className="color-presets-palette" role="group" aria-label="Preset colors">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`color-preset-dot ${value === preset ? 'color-preset-active' : ''}`}
            style={{ backgroundColor: preset }}
            onClick={() => onChange(preset)}
            disabled={disabled}
            aria-label={`Select color ${preset}`}
            title={preset}
          />
        ))}
      </div>
    </div>
  );
}
