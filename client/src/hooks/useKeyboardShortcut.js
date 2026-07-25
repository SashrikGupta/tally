import { useEffect } from 'react';

/**
 * Fires `handler` when `keys` (e.g. "mod+k", "escape") matches a keydown.
 * "mod" means Cmd on Mac, Ctrl elsewhere.
 */
export function useKeyboardShortcut(keys, handler, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return undefined;
    const parts = keys.toLowerCase().split('+');
    const wantsMod = parts.includes('mod');
    const wantsShift = parts.includes('shift');
    const key = parts.find((p) => !['mod', 'shift', 'ctrl', 'cmd'].includes(p));

    const onKeyDown = (e) => {
      const modOk = wantsMod ? e.ctrlKey || e.metaKey : true;
      const shiftOk = wantsShift ? e.shiftKey : true;
      if (modOk && shiftOk && e.key.toLowerCase() === key) {
        e.preventDefault();
        handler(e);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [keys, handler, enabled]);
}
