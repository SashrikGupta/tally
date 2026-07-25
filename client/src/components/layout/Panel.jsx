import { cn } from '../../lib/cn';

/**
 * The bordered/tabbed content region used throughout the IDE screens.
 * Replaces the old Card.jsx — no dynamic class props, real Tailwind classes only.
 */
export function Panel({ title, icon, actions, className, bodyClassName, scroll = false, children }) {
  return (
    <div
      className={cn(
        'glass glass-sheen flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-panel shadow-md',
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-subtle px-3 py-2">
          {typeof title === 'string' ? (
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-fg-muted">
              {icon && <span className="text-sm text-accent-border">{icon}</span>}
              {title}
            </h2>
          ) : (
            title
          )}
          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </div>
      )}
      <div className={cn('min-h-0 flex-1', scroll && 'overflow-y-auto themed-scrollbar', bodyClassName)}>{children}</div>
    </div>
  );
}
