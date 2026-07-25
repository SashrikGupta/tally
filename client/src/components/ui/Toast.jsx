import { createPortal } from 'react-dom';
import {
  IoAlertCircle,
  IoCheckmarkCircle,
  IoClose,
  IoInformationCircle,
  IoWarning,
} from 'react-icons/io5';
import { cn } from '../../lib/cn';
import { useToast } from '../../contexts/ToastContext';

const VARIANT = {
  success: 'border-success-border/50 text-success-border',
  danger: 'border-danger-border/50 text-danger-border',
  warning: 'border-warning-border/50 text-warning-border',
  info: 'border-border text-fg',
};

const ICON = {
  success: IoCheckmarkCircle,
  danger: IoAlertCircle,
  warning: IoWarning,
  info: IoInformationCircle,
};

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICON[t.variant] ?? ICON.info;
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'glass glass-sheen pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-overlay px-3 py-2.5',
              'text-sm shadow-overlay animate-[toast-in_var(--dur-base)_var(--ease-spring)]',
              VARIANT[t.variant] ?? VARIANT.info,
            )}
          >
            <Icon className="mt-0.5 shrink-0 text-base" aria-hidden="true" />
            <div className="flex-1 text-fg">
              {t.title && <div className="font-semibold">{t.title}</div>}
              <div className="text-fg-muted">{t.message}</div>
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-fg-subtle transition-colors hover:text-fg"
              aria-label="Dismiss"
            >
              <IoClose />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
