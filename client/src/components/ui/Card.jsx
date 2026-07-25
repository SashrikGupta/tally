import { cn } from '../../lib/cn';

/**
 * The base surface primitive.
 *
 * `glass` + `glass-sheen` are the two classes that make translucency work:
 * the first applies the user's backdrop blur, the second paints the diagonal
 * highlight that stops a see-through card from looking like a rendering bug.
 * Both collapse to nothing when the user sets opacity to 1 / blur to 0.
 *
 * Padding is passed via `className` with real Tailwind classes — never
 * interpolated from a prop (see Context/05-design-system.md).
 */
export function Card({ as: Tag = 'div', interactive = false, glow = false, className, children, ...props }) {
  return (
    <Tag
      className={cn(
        'glass glass-sheen rounded-lg border border-border bg-elevated shadow-md',
        'transition-all duration-base ease-out',
        interactive &&
          'cursor-pointer hover:-translate-y-0.5 hover:border-accent-border/60 hover:shadow-[var(--shadow-lg),var(--glow-accent-sm)]',
        glow && 'shadow-[var(--shadow-md),var(--glow-accent)]',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('flex items-center gap-2 border-t border-border-subtle px-4 py-3', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * A single headline number. Used across the profile and contest dashboards;
 * the accent bar keeps a row of them from reading as undifferentiated boxes.
 */
export function StatCard({ label, value, hint, icon, tone = 'accent', className }) {
  const TONE = {
    accent: 'text-accent-border',
    success: 'text-success-border',
    warning: 'text-warning-border',
    danger: 'text-danger-border',
    info: 'text-info-border',
  };
  return (
    <Card className={cn('relative overflow-hidden p-4', className)}>
      <span className={cn('absolute inset-x-0 top-0 h-px bg-current opacity-50', TONE[tone] ?? TONE.accent)} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{label}</p>
        {icon && <span className={cn('text-lg', TONE[tone] ?? TONE.accent)}>{icon}</span>}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-fg">{value}</p>
      {hint && <p className="mt-1 text-xs text-fg-muted">{hint}</p>}
    </Card>
  );
}
