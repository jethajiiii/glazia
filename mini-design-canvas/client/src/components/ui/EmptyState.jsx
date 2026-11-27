/**
 * Reusable Empty State placeholder component.
 *
 * @param {{
 *   title: string,
 *   description?: string,
 *   icon?: React.ReactNode,
 *   action?: React.ReactNode,
 *   className?: string
 * }} props
 */
export function EmptyState({ title, description, icon, action, className = '' }) {
  return (
    <div className={`empty-state ${className}`} role="status">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
