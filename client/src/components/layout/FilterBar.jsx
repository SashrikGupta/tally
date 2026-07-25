import { cn } from '../../lib/cn';

/**
 * The pill row used above every filterable list. Extracted because four
 * screens had grown their own copy of the same markup with slightly different
 * active-state colours.
 */
export function FilterPills({ options, value, onChange, className }) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((opt) => {
        const id = typeof opt === 'string' ? opt : opt.id;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-fast',
              active
                ? 'border-accent-border bg-accent-soft text-accent-border shadow-[var(--glow-accent-sm)]'
                : 'border-border text-fg-muted hover:border-border-focus hover:text-fg',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** The toolbar strip that holds search + filters between header and content. */
export function FilterBar({ className, children }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 px-6 py-3', className)}>{children}</div>
  );
}
