import { cn } from '../../lib/cn';

export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex animate-fade-in flex-col items-center justify-center gap-2 px-6 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-elevated text-2xl text-fg-subtle shadow-[var(--shadow-md),var(--glow-accent-sm)]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      {description && <p className="max-w-sm text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
