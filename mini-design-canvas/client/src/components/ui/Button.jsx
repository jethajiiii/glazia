import { Spinner } from './Spinner.jsx';

/**
 * Generic reusable Button primitive.
 *
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline',
 *   size?: 'sm' | 'md' | 'lg',
 *   isLoading?: boolean,
 *   fullWidth?: boolean,
 *   disabled?: boolean,
 *   type?: 'button' | 'submit' | 'reset',
 *   children: React.ReactNode,
 *   className?: string
 * }} props
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    isLoading ? 'btn-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="btn-spinner" />}
      <span className="btn-content">{children}</span>
    </button>
  );
}
