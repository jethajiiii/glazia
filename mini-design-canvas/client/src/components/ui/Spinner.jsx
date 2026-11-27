/**
 * Accessible loading spinner indicator.
 *
 * @param {{ size?: 'sm' | 'md' | 'lg', color?: string }} props
 */
export function Spinner({ size = 'md', color = 'currentColor', className = '' }) {
  return (
    <span
      className={`spinner spinner-${size} ${className}`}
      role="status"
      aria-label="Loading"
      style={{ borderTopColor: color }}
    />
  );
}
