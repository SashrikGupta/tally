import { forwardRef, useId } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import { cn } from '../../lib/cn';

function FieldWrapper({ label, hint, error, id, className, children }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <span className="text-xs text-danger-border">{error}</span>
      ) : hint ? (
        <span className="text-xs text-fg-subtle">{hint}</span>
      ) : null}
    </div>
  );
}

const fieldClasses = (error) =>
  cn(
    'w-full rounded-md border bg-inset px-3 py-2 text-sm text-fg placeholder:text-fg-subtle',
    'transition-all duration-fast ease-out outline-none',
    error
      ? 'border-danger-border focus:shadow-[var(--glow-danger)]'
      : 'border-border focus:border-accent-border focus:shadow-[var(--glow-accent-sm)]',
  );

export const Input = forwardRef(function Input(
  { label, hint, error, id, className, wrapperClassName, prefix, suffix, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldWrapper label={label} hint={hint} error={error} id={fieldId} className={wrapperClassName}>
      <div className="relative flex items-center">
        {prefix && <span className="pointer-events-none absolute left-3 text-fg-subtle">{prefix}</span>}
        <input
          ref={ref}
          id={fieldId}
          className={cn(fieldClasses(error), prefix && 'pl-9', suffix && 'pr-9', className)}
          {...props}
        />
        {suffix && <span className="absolute right-3 text-fg-subtle">{suffix}</span>}
      </div>
    </FieldWrapper>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, hint, error, id, className, wrapperClassName, rows = 4, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldWrapper label={label} hint={hint} error={error} id={fieldId} className={wrapperClassName}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        className={cn(fieldClasses(error), 'resize-y leading-relaxed', className)}
        {...props}
      />
    </FieldWrapper>
  );
});

export const Select = forwardRef(function Select(
  { label, hint, error, id, className, wrapperClassName, children, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldWrapper label={label} hint={hint} error={error} id={fieldId} className={wrapperClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          className={cn(fieldClasses(error), 'cursor-pointer appearance-none pr-9', className)}
          {...props}
        >
          {children}
        </select>
        <IoChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle"
        />
      </div>
    </FieldWrapper>
  );
});

/** On/off control. Used throughout Settings in place of bare checkboxes. */
export function Switch({ checked, onChange, label, description, disabled, className }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start justify-between gap-4 py-1',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span className="flex flex-col">
        <span className="text-sm font-medium text-fg">{label}</span>
        {description && <span className="text-xs text-fg-muted">{description}</span>}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            'block h-5 w-9 rounded-full border transition-all duration-base ease-out',
            checked ? 'border-accent-border bg-accent shadow-[var(--glow-accent-sm)]' : 'border-border bg-inset-solid',
          )}
        />
        <span
          className={cn(
            'pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-fg transition-transform duration-base ease-spring',
            checked && 'translate-x-4 bg-accent-fg',
          )}
        />
      </span>
    </label>
  );
}

/**
 * Labelled range input with a live readout. Settings has a dozen of these, so
 * the label/value/unit layout lives here rather than being repeated per row.
 */
export function Slider({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  format,
  disabled,
  className,
}) {
  const display = format ? format(value) : `${value}${unit}`;
  return (
    <div className={cn('flex flex-col gap-1.5', disabled && 'pointer-events-none opacity-50', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-fg">{label}</span>
        <span className="font-mono text-xs tabular-nums text-accent-border">{display}</span>
      </div>
      {description && <span className="-mt-1 text-xs text-fg-muted">{description}</span>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full"
      />
    </div>
  );
}

/** Mutually exclusive options rendered as a single pill group. */
export function SegmentedControl({ options, value, onChange, className, size = 'md' }) {
  return (
    <div role="radiogroup" className={cn('inline-flex rounded-md border border-border bg-inset p-0.5', className)}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              'rounded-[calc(var(--radius-md)-2px)] font-medium transition-all duration-fast ease-out',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              active ? 'bg-accent text-accent-fg shadow-[var(--glow-accent-sm)]' : 'text-fg-muted hover:text-fg',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
