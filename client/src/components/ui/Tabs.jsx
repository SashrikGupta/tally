import { useId, useRef } from 'react';
import { cn } from '../../lib/cn';

export function Tabs({ tabs, value, onChange, className }) {
  const groupId = useId();
  const refs = useRef([]);

  const onKeyDown = (e, index) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    refs.current[next]?.focus();
    onChange(tabs[next].id);
  };

  return (
    <div role="tablist" aria-label={groupId} className={cn('flex gap-1 border-b border-border-subtle', className)}>
      {tabs.map((tab, i) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'relative px-3.5 py-2 text-sm font-medium transition-colors duration-fast',
              active ? 'text-accent-border' : 'text-fg-muted hover:text-fg',
            )}
          >
            {tab.label}
            {tab.badge != null && (
              <span className="ml-1.5 rounded-full bg-overlay px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
                {tab.badge}
              </span>
            )}
            {active && (
              <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-accent-border shadow-[var(--glow-accent-sm)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
