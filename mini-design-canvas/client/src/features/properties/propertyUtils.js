/**
 * Clamps a number to inclusive minimum and maximum limits.
 *
 * @param {number} value
 * @param {number} [min]
 * @param {number} [max]
 * @returns {number}
 */
export function clampNumber(value, min, max) {
  let clamped = value;
  if (typeof min === 'number' && !isNaN(min) && clamped < min) {
    clamped = min;
  }
  if (typeof max === 'number' && !isNaN(max) && clamped > max) {
    clamped = max;
  }
  return clamped;
}

/**
 * Safely parses and normalizes user input into a validated numeric value.
 * Handles empty strings, NaN, rounding, and boundary clamping.
 *
 * @param {any} rawValue - User input
 * @param {number} fallback - Fallback value if input is invalid or NaN
 * @param {object} [options={}] - Options { min, max, round }
 * @returns {number} Sanitized number
 */
export function parseNumericInput(rawValue, fallback = 0, options = {}) {
  const { min, max, round = true } = options;

  if (rawValue === '' || rawValue === null || rawValue === undefined) {
    return clampNumber(fallback, min, max);
  }

  const parsed = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue));

  if (isNaN(parsed)) {
    return clampNumber(fallback, min, max);
  }

  const normalized = round ? Math.round(parsed) : parsed;
  return clampNumber(normalized, min, max);
}

/**
 * Validates a color hex string against standard 3, 6, or 8-digit hexadecimal patterns.
 *
 * @param {string} color
 * @returns {boolean}
 */
export function isValidHexColor(color) {
  if (typeof color !== 'string') return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color.trim());
}

/**
 * Sanitizes property values according to their field configuration.
 *
 * @param {object} fieldConfig - Field configuration definition
 * @param {any} rawValue - Raw incoming value
 * @param {any} currentValue - Current element property value as fallback
 * @returns {any} Sanitized value
 */
export function sanitizePropertyValue(fieldConfig, rawValue, currentValue) {
  if (fieldConfig.input === 'number') {
    return parseNumericInput(rawValue, currentValue ?? 0, {
      min: fieldConfig.min,
      max: fieldConfig.max,
      round: fieldConfig.round ?? true,
    });
  }

  if (fieldConfig.input === 'color') {
    const trimmed = String(rawValue || '').trim();
    return isValidHexColor(trimmed) ? trimmed : currentValue || '#000000';
  }

  if (fieldConfig.input === 'text') {
    return String(rawValue ?? '');
  }

  return rawValue;
}
