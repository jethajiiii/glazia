/**
 * Labelled text input component with accessible error and helper states.
 *
 * @param {{
 *   label: string,
 *   id: string,
 *   value: string,
 *   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   error?: string,
 *   helperText?: string,
 *   className?: string
 * }} props
 */
export function TextInput({
  label,
  id,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  className = '',
  ...props
}) {
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input
        type="text"
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        className={`input-field ${error ? 'input-field-error' : ''}`}
        {...props}
      />
      {error && (
        <span id={errorId} className="input-error-msg" role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={helperId} className="input-helper-msg">
          {helperText}
        </span>
      )}
    </div>
  );
}
