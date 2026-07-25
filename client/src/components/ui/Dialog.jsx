import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { cn } from '../../lib/cn';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onClose, title, children, footer, className, size = 'md' }) {
  const contentRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const node = contentRef.current;
    const focusables = node?.querySelectorAll(FOCUSABLE);
    focusables?.[0]?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key === 'Tab' && focusables?.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const SIZE = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'glass glass-sheen relative z-10 w-full animate-scale-in rounded-xl border border-border bg-overlay',
          'shadow-[var(--shadow-overlay),var(--glow-accent-sm)]',
          SIZE[size],
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
            <h2 className="text-sm font-semibold text-fg">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-fg-muted transition-colors hover:bg-elevated hover:text-fg"
              aria-label="Close"
            >
              <IoClose />
            </button>
          </div>
        )}
        <div className="px-4 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border-subtle px-4 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
