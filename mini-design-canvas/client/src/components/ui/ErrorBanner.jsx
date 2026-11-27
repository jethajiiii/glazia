import { Button } from './Button.jsx';

/**
 * Accessible Error alert banner.
 *
 * @param {{
 *   message: string,
 *   details?: any,
 *   onRetry?: () => void,
 *   onDismiss?: () => void,
 *   className?: string
 * }} props
 */
export function ErrorBanner({ message, details, onRetry, onDismiss, className = '' }) {
  if (!message) return null;

  return (
    <div className={`error-banner ${className}`} role="alert">
      <div className="error-banner-content">
        <strong className="error-banner-title">Error</strong>
        <p className="error-banner-message">{message}</p>
        {details && (
          <span className="error-banner-details">
            {typeof details === 'string' ? details : JSON.stringify(details)}
          </span>
        )}
      </div>

      <div className="error-banner-actions">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="error-banner-dismiss"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
