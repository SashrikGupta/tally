import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, { variant = 'info', duration = 4000, title } = {}) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, variant, title }]);
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      toasts,
      dismiss,
      success: (message, opts) => push(message, { ...opts, variant: 'success' }),
      error: (message, opts) => push(message, { ...opts, variant: 'danger', duration: opts?.duration ?? 6000 }),
      info: (message, opts) => push(message, { ...opts, variant: 'info' }),
      warning: (message, opts) => push(message, { ...opts, variant: 'warning' }),
    }),
    [toasts, dismiss, push],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
