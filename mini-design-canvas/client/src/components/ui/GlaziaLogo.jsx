import React from 'react';

/**
 * Architectural Glazia Logo Icon & Typography
 * Represents architectural glazing, faceted window glass, and precision design.
 */
export function GlaziaLogo({ showText = true, size = 26, className = '' }) {
  return (
    <div className={`glazia-brand ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="glazia-grad1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0284c7" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="glazia-grad2" x1="16" y1="2" x2="30" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="glazia-grad3" x1="2" y1="14" x2="16" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60a5fa" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        {/* Architectural Glazed Facet Diamond/Prism */}
        <path d="M16 2L29 11L16 30L3 11L16 2Z" fill="url(#glazia-grad1)" />
        <path d="M16 2L29 11L16 17L3 11L16 2Z" fill="url(#glazia-grad2)" opacity="0.9" />
        <path d="M16 17L29 11L16 30L16 17Z" fill="#1d4ed8" opacity="0.4" />
        <path d="M3 11L16 17L16 30L3 11Z" fill="url(#glazia-grad3)" opacity="0.9" />
        {/* Light Glass Refraction Highlight */}
        <path d="M12 6L16 3L18 8L14 11L12 6Z" fill="#ffffff" opacity="0.65" />
      </svg>
      {showText && (
        <span
          className="glazia-brand-name"
          style={{
            fontWeight: 700,
            fontSize: '1.125rem',
            letterSpacing: '-0.025em',
            color: 'var(--color-text-main, #1a1b22)',
            fontFamily: "'Geist', 'Inter', sans-serif",
          }}
        >
          Glazia
        </span>
      )}
    </div>
  );
}
