import { IoAlertCircleOutline, IoRefreshOutline } from 'react-icons/io5';
import { cn } from '../../lib/cn';
import { Button } from './Button';

export function ErrorState({ error, onRetry, className, title = 'Something went wrong' }) {
  const message = error?.message || 'An unexpected error occurred.';
  return (
    <div
      className={cn(
        'flex animate-fade-in flex-col items-center justify-center gap-2 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-danger-border/40 bg-danger/10 text-2xl text-danger-border shadow-[var(--shadow-md),var(--glow-danger)]">
        <IoAlertCircleOutline aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      <p className="max-w-sm text-sm text-fg-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" iconLeft={<IoRefreshOutline />} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
