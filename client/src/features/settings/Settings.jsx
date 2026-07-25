import { useState } from 'react';
import {
  IoColorPaletteOutline,
  IoCodeSlashOutline,
  IoKeypadOutline,
  IoPersonOutline,
  IoServerOutline,
  IoShieldCheckmarkOutline,
  IoSettingsOutline,
} from 'react-icons/io5';
import { PageHeader } from '../../components/layout/PageHeader';
import { cn } from '../../lib/cn';
import { AppearanceSection } from './sections/AppearanceSection';
import { EditorSection } from './sections/EditorSection';
import { KeybindingsSection } from './sections/KeybindingsSection';
import { PlaygroundSection } from './sections/PlaygroundSection';
import { ProfileSection } from './sections/ProfileSection';
import { AccountSection } from './sections/AccountSection';

const NAV = [
  { id: 'appearance', label: 'Appearance', icon: IoColorPaletteOutline, component: AppearanceSection },
  { id: 'editor', label: 'Editor', icon: IoCodeSlashOutline, component: EditorSection },
  { id: 'keybindings', label: 'Keybindings', icon: IoKeypadOutline, component: KeybindingsSection },
  { id: 'playground', label: 'Playground', icon: IoServerOutline, component: PlaygroundSection },
  { id: 'profile', label: 'Profile', icon: IoPersonOutline, component: ProfileSection },
  { id: 'account', label: 'Account', icon: IoShieldCheckmarkOutline, component: AccountSection },
];

export function Settings() {
  const [active, setActive] = useState('appearance');
  const ActiveSection = NAV.find((n) => n.id === active)?.component ?? AppearanceSection;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Settings"
        icon={<IoSettingsOutline />}
        description="Every change applies instantly — there's no save button for appearance."
        sticky={false}
      />
      <div className="flex min-h-0 flex-1">
        <nav className="w-52 shrink-0 border-r border-border-subtle p-3">
          <ul className="flex flex-col gap-0.5">
            {NAV.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => setActive(n.id)}
                  aria-current={active === n.id ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium',
                    'transition-all duration-fast',
                    active === n.id
                      ? 'bg-accent-soft text-accent-border shadow-[var(--glow-accent-sm)]'
                      : 'text-fg-muted hover:bg-elevated hover:text-fg',
                  )}
                >
                  <n.icon aria-hidden="true" className="text-base" />
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="themed-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
          {/* Keyed so switching panes replays the entrance animation. */}
          <div key={active} className="animate-fade-in">
            <ActiveSection />
          </div>
        </div>
      </div>
    </div>
  );
}
