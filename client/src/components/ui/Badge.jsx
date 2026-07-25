import { cn } from '../../lib/cn';

// Every colour is resolved through this fixed map — never interpolated.
const VARIANT = {
  neutral: 'bg-overlay text-fg-muted border-border',
  accent: 'bg-accent-soft text-accent-border border-accent-border/40',
  success: 'bg-success/15 text-success-border border-success-border/40',
  warning: 'bg-warning/15 text-warning-border border-warning-border/40',
  danger: 'bg-danger/15 text-danger-border border-danger-border/40',
  info: 'bg-info/15 text-info-border border-info-border/40',
  easy: 'bg-easy/15 text-easy border-easy/40',
  medium: 'bg-medium/15 text-medium border-medium/40',
  hard: 'bg-hard/15 text-hard border-hard/40',
};

// Which variants get a neon halo at high glow settings. Neutral badges are
// pure chrome and would turn a dense list into a light show.
const GLOWING = new Set(['accent', 'success', 'danger', 'easy', 'medium', 'hard']);

const DIFFICULTY_VARIANT = { Easy: 'easy', Medium: 'medium', Hard: 'hard' };

export function Badge({ variant = 'neutral', dot = false, className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium leading-none',
        'transition-colors duration-fast',
        VARIANT[variant] ?? VARIANT.neutral,
        GLOWING.has(variant) && 'shadow-[0_0_calc(12px*var(--glow))_currentColor]',
        className,
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty, className }) {
  return (
    <Badge variant={DIFFICULTY_VARIANT[difficulty] ?? 'neutral'} className={className}>
      {difficulty ?? 'Unknown'}
    </Badge>
  );
}
