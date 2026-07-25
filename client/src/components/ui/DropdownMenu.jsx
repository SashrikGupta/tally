import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

export function DropdownMenu({ trigger, items, align = 'right', className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            // -solid: a menu floats over arbitrary page content, so it opts out
            // of the user's translucency setting to stay readable.
            'absolute z-40 mt-1.5 min-w-[11rem] animate-scale-in overflow-hidden rounded-lg border border-border',
            'bg-overlay-solid py-1 shadow-overlay origin-top',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {items.map((item) =>
            item.divider ? (
              <div key={item.id} className="my-1 h-px bg-border-subtle" />
            ) : (
              <button
                key={item.id}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-fg',
                  'transition-colors duration-fast hover:bg-accent-soft hover:text-accent-border',
                  item.danger && 'text-danger-border hover:bg-danger/15 hover:text-danger-border',
                )}
              >
                {item.icon && <span className="text-base">{item.icon}</span>}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
