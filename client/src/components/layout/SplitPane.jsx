import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { readStorage, writeStorage } from '../../lib/storage';

// Always calls a hook the same way regardless of whether `persistKey` is
// provided, so callers can pass it conditionally without breaking the
// rules of hooks.
function useSplitRatio(persistKey, defaultRatio) {
  const [ratio, setRatio] = useState(() =>
    persistKey ? readStorage(`codeconnect:split:${persistKey}`, defaultRatio) : defaultRatio,
  );
  const set = useCallback(
    (next) => {
      setRatio((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        if (persistKey) writeStorage(`codeconnect:split:${persistKey}`, resolved);
        return resolved;
      });
    },
    [persistKey],
  );
  return [ratio, set];
}

/**
 * Draggable two-pane split, horizontal or vertical. The split ratio is
 * persisted to localStorage per `persistKey` so a user's layout choice
 * survives navigation and reload.
 */
export function SplitPane({
  direction = 'horizontal', // 'horizontal' = side-by-side, 'vertical' = stacked
  persistKey,
  defaultRatio = 0.5,
  min = 0.2,
  max = 0.8,
  first,
  second,
  className,
}) {
  const [ratio, setRatio] = useSplitRatio(persistKey, defaultRatio);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const onPointerMove = useCallback(
    (e) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pos = direction === 'horizontal' ? (e.clientX - rect.left) / rect.width : (e.clientY - rect.top) / rect.height;
      setRatio(Math.min(max, Math.max(min, pos)));
    },
    [direction, min, max, setRatio],
  );

  const stopDrag = useCallback(() => {
    dragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDrag);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDrag);
    };
  }, [onPointerMove, stopDrag]);

  const startDrag = () => {
    dragging.current = true;
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const isRow = direction === 'horizontal';

  return (
    <div ref={containerRef} className={cn('flex min-h-0 min-w-0 flex-1', isRow ? 'flex-row' : 'flex-col', className)}>
      <div className="min-h-0 min-w-0 overflow-hidden" style={{ flexBasis: `${ratio * 100}%` }}>
        {first}
      </div>
      <button
        type="button"
        aria-label="Resize panels"
        onPointerDown={startDrag}
        className={cn(
          'group relative shrink-0 bg-transparent',
          isRow ? 'w-2 cursor-col-resize' : 'h-2 cursor-row-resize',
        )}
      >
        {/* Thin at rest, thick and lit on hover — the hit area stays 8px
            either way so the handle is grabbable without looking heavy. */}
        <div
          className={cn(
            'absolute rounded-full bg-border-subtle transition-all duration-fast',
            'group-hover:bg-accent-border group-hover:shadow-[var(--glow-accent-sm)]',
            isRow
              ? 'inset-y-0 left-1/2 w-px -translate-x-1/2 group-hover:w-0.5'
              : 'inset-x-0 top-1/2 h-px -translate-y-1/2 group-hover:h-0.5',
          )}
        />
      </button>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{second}</div>
    </div>
  );
}
