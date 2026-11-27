/**
 * Labelled numeric input with optional unit suffix and boundary validation.
 *
 * @param {{
 *   label: string,
 *   id: string,
 *   value: number | string,
 *   onChange: (value: number) => void,
 *   min?: number,
 *   max?: number,
 *   step?: number,
 *   unit?: string,
 *   error?: string,
 *   className?: string
 * }} props
 */
export function NumberInput({
  label,
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  error,
  disabled = false,
  className = '',
  ...props
}) {
  const handleChange = (e) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      onChange(0);
      return;
    }
    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        <input
          type="number"
          id={id}
          value={value ?? 0}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={`input-field ${unit ? 'input-field-with-unit' : ''} ${
            error ? 'input-field-error' : ''
          }`}
          {...props}
        />
        {unit && <span className="input-unit">{unit}</span>}
      </div>
      {error && (
        <span className="input-error-msg" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
