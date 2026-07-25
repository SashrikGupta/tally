import { cn } from '../../lib/cn';

/**
 * The band at the top of every feature screen. Sticky, so the primary action
 * stays reachable in a long list, and translucent so content scrolling under
 * it reads as depth rather than as a rendering seam.
 */
export function PageHeader({ title, description, icon, actions, className, sticky = true }) {
  return (
    <div
      className={cn(
        'glass z-20 flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle bg-base px-6 py-4',
        sticky && 'sticky top-0',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent-border/30 bg-accent-soft text-lg text-accent-border shadow-[var(--glow-accent-sm)]">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-fg">{title}</h1>
          {description && <p className="mt-0.5 truncate text-sm text-fg-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
