import { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

/*
 * Variants are a fixed map — never interpolated. Each pairs a token-driven
 * surface with the matching glow, so raising the neon slider lights up the
 * primary/danger/success actions and leaves the quiet ones alone.
 */
const VARIANT = {
  primary:
    'bg-accent text-accent-fg border border-accent-border/60 shadow-[var(--shadow-sm),var(--glow-accent-sm)] hover:brightness-110 hover:shadow-[var(--shadow-md),var(--glow-accent)]',
  secondary:
    'bg-elevated text-fg border border-border glass hover:bg-overlay hover:border-border-focus/60',
  ghost: 'bg-transparent text-fg-muted border border-transparent hover:bg-elevated hover:text-fg',
  subtle: 'bg-accent-soft text-accent-border border border-accent-border/30 hover:bg-accent/25',
  danger:
    'bg-danger text-danger-fg border border-danger-border/60 shadow-sm hover:brightness-110 hover:shadow-[var(--shadow-md),var(--glow-danger)]',
  success:
    'bg-success text-success-fg border border-success-border/60 shadow-sm hover:brightness-110 hover:shadow-[var(--shadow-md),var(--glow-success)]',
  outline: 'bg-transparent text-fg border border-border hover:border-accent-border hover:text-accent-border',
};

const SIZE = {
  xs: 'h-6 px-2 text-xs gap-1 rounded-sm',
  sm: 'h-8 px-2.5 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-md',
  lg: 'h-11 px-5 text-base gap-2 rounded-lg',
  icon: 'h-9 w-9 rounded-md',
};

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, iconLeft, iconRight, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'group relative inline-flex shrink-0 items-center justify-center font-medium',
        'transition-all duration-fast ease-out active:scale-[0.97]',
        'disabled:pointer-events-none disabled:opacity-45',
        VARIANT[variant] ?? VARIANT.primary,
        SIZE[size] ?? SIZE.md,
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size={size === 'lg' ? 18 : 14} /> : iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  );
});

/** Square icon-only button. Keeps the accessible name mandatory. */
export const IconButton = forwardRef(function IconButton({ label, className, children, ...props }, ref) {
  return (
    <Button ref={ref} size="icon" variant="ghost" aria-label={label} className={cn('p-0', className)} {...props}>
      {children}
    </Button>
  );
});
