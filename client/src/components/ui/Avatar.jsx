import { cn } from '../../lib/cn';
import { initials } from '../../lib/format';

const SIZE = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
};

export function Avatar({ src, name = '', size = 'md', ring = false, className }) {
  const shared = cn(
    'shrink-0 rounded-full border border-border object-cover',
    ring && 'ring-2 ring-accent-border/50 ring-offset-2 ring-offset-transparent shadow-[var(--glow-accent-sm)]',
    SIZE[size] ?? SIZE.md,
    className,
  );

  if (src) return <img src={src} alt={name} className={shared} />;

  return (
    <div className={cn('flex items-center justify-center bg-accent-soft font-semibold text-accent-border', shared)}>
      {initials(name) || '?'}
    </div>
  );
}
