import { useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { useSettings } from '../../../contexts/SettingsContext';
import { KEYMAPS } from '../../../lib/constants';
import { Section } from '../../../components/layout/Section';
import { Card, Input, SegmentedControl } from '../../../components/ui';

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], action: 'Open command palette' },
  { keys: ['Ctrl', 'Enter'], action: 'Run code' },
  { keys: ['Ctrl', 'S'], action: 'Submit (on a problem)' },
  { keys: ['Ctrl', '/'], action: 'Toggle the assistant' },
  { keys: ['Esc'], action: 'Close a dialog or the palette' },
];

export function KeybindingsSection() {
  const { settings, setKeymap } = useSettings();
  const [search, setSearch] = useState('');

  const filtered = SHORTCUTS.filter((s) => s.action.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <Section title="Editor keymap">
        <SegmentedControl
          value={settings.keymap}
          onChange={setKeymap}
          options={KEYMAPS.map((k) => ({ id: k.id, label: k.label }))}
        />
        {settings.keymap !== 'default' && (
          <p className="text-xs text-fg-muted">
            {settings.keymap === 'vim' ? 'Vim' : 'Emacs'} bindings apply inside the code editor only; the app-wide
            shortcuts below still work.
          </p>
        )}
      </Section>

      <Section title="Shortcut reference" description="Cmd replaces Ctrl on macOS.">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search shortcuts…"
          prefix={<IoSearchOutline />}
          className="w-64"
        />
        <Card className="divide-y divide-border-subtle">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-fg-muted">No shortcuts match.</div>
          )}
          {filtered.map((s) => (
            <div key={s.action} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
              <span className="text-fg-muted">{s.action}</span>
              <span className="flex shrink-0 items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded border border-border bg-inset px-1.5 py-0.5 font-mono text-[11px] text-fg"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </Card>
      </Section>
    </div>
  );
}
