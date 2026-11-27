/**
 * Generic Icon Button primitive for toolbars and quick actions.
 *
 * @param {{
 *   'aria-label': string,
 *   title?: string,
 *   variant?: 'ghost' | 'secondary' | 'primary',
 *   size?: 'sm' | 'md' | 'lg',
 *   isActive?: boolean,
 *   disabled?: boolean,
 *   children: React.ReactNode,
 *   className?: string
 * }} props
 */
export function IconButton({
  children,
  'aria-label': ariaLabel,
  title,
  variant = 'ghost',
  size = 'md',
  isActive = false,
  disabled = false,
  className = '',
  ...props
}) {
  const classes = [
    'icon-btn',
    `icon-btn-${variant}`,
    `icon-btn-${size}`,
    isActive ? 'icon-btn-active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      disabled={disabled}
      aria-pressed={isActive}
      {...props}
    >
      {children}
    </button>
  );
}
