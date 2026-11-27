/**
 * Formats an ISO date/timestamp string into a concise human-friendly relative label.
 *
 * @param {string | Date} isoDate - ISO 8601 date string or Date instance
 * @returns {string} E.g., 'just now', '5m ago', '2h ago', 'yesterday', 'Jan 15'
 */
export function formatRelativeTime(isoDate) {
  if (!isoDate) return '';

  const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // If in future or less than 30 seconds ago
  if (diffMs < 30_000) {
    return 'just now';
  }

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) {
    return 'yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  // Format as 'Mon DD' (e.g. 'Nov 27')
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
