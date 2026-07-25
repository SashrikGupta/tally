import { useId, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

export function Tooltip({ label, children, side = 'top', className }) {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const id = useId();

  const show = () => {
    timer.current = setTimeout(() => setOpen(true), 300);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  const SIDE = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {typeof children === 'function' ? children({ 'aria-describedby': id }) : children}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-border bg-overlay px-2 py-1 text-xs text-fg shadow-md',
            SIDE[side],
            className,
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
