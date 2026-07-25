import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoFlashOutline,
  IoTrophyOutline,
  IoHelpBuoyOutline,
  IoCodeSlashOutline,
  IoPeopleOutline,
  IoSettingsOutline,
  IoColorPaletteOutline,
  IoHomeOutline,
  IoPersonOutline,
  IoAddOutline,
  IoInformationCircleOutline,
  IoLogOutOutline,
  IoSearchOutline,
  IoReturnDownBackOutline,
} from 'react-icons/io5';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { APPEARANCE_PRESETS, THEMES } from '../../lib/constants';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Commands are grouped so the palette stays legible once themes are in it —
 * eighteen theme entries would otherwise bury the seven navigation ones.
 */
function useCommands() {
  const navigate = useNavigate();
  const { userId, logout } = useAuth();
  const { setAppearance } = useSettings();

  return useMemo(() => {
    const go = (to) => () => navigate(to);

    const navigation = [
      { id: 'home', label: 'Home', icon: IoHomeOutline, run: go('/home') },
      { id: 'arena', label: 'Arena — practice problems', icon: IoFlashOutline, run: go('/problems') },
      { id: 'battle', label: 'Battle — contests', icon: IoTrophyOutline, run: go('/contests') },
      { id: 'queries', label: 'Queries', icon: IoHelpBuoyOutline, run: go('/queries') },
      { id: 'playground', label: 'Playground', icon: IoCodeSlashOutline, run: go('/playground') },
      { id: 'connect', label: 'Connect — member directory', icon: IoPeopleOutline, run: go('/connect') },
      { id: 'profile', label: 'My profile', icon: IoPersonOutline, run: go(userId ? `/u/${userId}` : '/home') },
      { id: 'settings', label: 'Settings', icon: IoSettingsOutline, run: go('/settings') },
      { id: 'about', label: 'About CodeConnect', icon: IoInformationCircleOutline, run: go('/about') },
    ].map((c) => ({ ...c, group: 'Go to' }));

    const actions = [
      { id: 'new-problem', label: 'New problem', icon: IoAddOutline, run: go('/problems/new') },
      { id: 'new-contest', label: 'New contest', icon: IoAddOutline, run: go('/contests/new') },
      { id: 'new-query', label: 'Post a query', icon: IoAddOutline, run: go('/queries/new') },
      { id: 'sign-out', label: 'Sign out', icon: IoLogOutOutline, run: logout },
    ].map((c) => ({ ...c, group: 'Actions' }));

    const presets = APPEARANCE_PRESETS.map((p) => ({
      id: `preset-${p.id}`,
      label: `Preset: ${p.label}`,
      icon: IoColorPaletteOutline,
      group: 'Appearance',
      run: () => setAppearance(p.patch),
    }));

    const themes = THEMES.map((t) => ({
      id: `theme-${t.id}`,
      label: `Theme: ${t.label}`,
      icon: IoColorPaletteOutline,
      group: 'Themes',
      swatch: t.swatch,
      run: () => setAppearance({ theme: t.id }),
    }));

    return [...navigation, ...actions, ...presets, ...themes];
  }, [navigate, userId, logout, setAppearance]);
}

export function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const commands = useCommands();
  const listRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => setActiveIndex(0), [query, open]);
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  // Keep the highlighted row in view when arrowing past the visible window.
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) return null;

  const run = (cmd) => {
    cmd.run();
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      run(results[activeIndex]);
    }
  };

  let lastGroup = null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[14vh]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="glass glass-sheen relative z-10 w-full max-w-xl animate-scale-in overflow-hidden rounded-xl border border-border bg-overlay shadow-[var(--shadow-overlay),var(--glow-accent-sm)]">
        <div className="flex items-center gap-2.5 border-b border-border-subtle px-4">
          <IoSearchOutline className="shrink-0 text-fg-subtle" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page or theme…"
            aria-label="Command palette"
            className="w-full bg-transparent py-3.5 text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
          <kbd className="shrink-0 rounded border border-border bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle">
            Esc
          </kbd>
        </div>

        <div ref={listRef} role="listbox" className="themed-scrollbar max-h-[22rem] overflow-y-auto py-1.5">
          {results.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-fg-muted">No matching commands</div>
          )}
          {results.map((cmd, i) => {
            const showGroup = cmd.group !== lastGroup;
            lastGroup = cmd.group;
            const active = i === activeIndex;
            return (
              <div key={cmd.id}>
                {showGroup && (
                  <div className="px-4 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">
                    {cmd.group}
                  </div>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  data-active={active}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => run(cmd)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors duration-fast',
                    active ? 'bg-accent-soft text-accent-border' : 'text-fg-muted hover:text-fg',
                  )}
                >
                  {cmd.swatch ? (
                    <span
                      className="h-4 w-4 shrink-0 rounded-full border border-black/25"
                      style={{ background: `linear-gradient(135deg, ${cmd.swatch[0]} 50%, ${cmd.swatch[1]} 50%)` }}
                      aria-hidden="true"
                    />
                  ) : (
                    <cmd.icon className="shrink-0" aria-hidden="true" />
                  )}
                  <span className="flex-1 truncate">{cmd.label}</span>
                  {active && <IoReturnDownBackOutline className="shrink-0 text-xs" aria-hidden="true" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
