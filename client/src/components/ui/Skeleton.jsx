import { cn } from '../../lib/cn';

/**
 * A shimmer sweep rather than a plain pulse — at low opacity a pulsing block
 * on a translucent surface is nearly invisible, while the moving highlight
 * still reads.
 */
export function Skeleton({ className }) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-md bg-overlay', className)}
      style={{
        backgroundImage:
          'linear-gradient(90deg, transparent 0%, rgb(var(--fg-rgb) / 0.07) 50%, transparent 100%)',
        backgroundSize: '180% 100%',
        animation: 'shimmer 1.6s linear infinite',
      }}
    />
  );
}

export function TableSkeleton({ rows = 6, cols = 4 }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className={cn('h-8 flex-1', c === 0 && 'max-w-[3rem] flex-none')} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full" />
      ))}
    </div>
  );
}
