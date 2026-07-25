import { cn } from '../../lib/cn';

export function Section({ title, description, actions, className, children }) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-fg">{title}</h3>}
            {description && <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
