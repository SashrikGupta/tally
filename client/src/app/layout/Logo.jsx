import { cn } from '../../lib/cn';

/**
 * Inline SVG rather than the /logo.png bitmap: it takes the accent colour from
 * the active theme, stays crisp at any size, and carries the neon halo the
 * rest of the chrome uses.
 */
export function Logo({ size = 22, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0 drop-shadow-[var(--glow-accent-sm)]', className)}
    >
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="8"
        fill="rgb(var(--accent-rgb) / 0.18)"
        stroke="rgb(var(--accent-hi-rgb) / 0.7)"
        strokeWidth="1.5"
      />
      {/* `</>` — the angle brackets bracket a connecting node */}
      <path
        d="M12 11L7.5 16L12 21"
        stroke="rgb(var(--accent-hi-rgb))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 11L24.5 16L20 21"
        stroke="rgb(var(--accent-hi-rgb))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="2.25" fill="rgb(var(--info-rgb))" />
    </svg>
  );
}
