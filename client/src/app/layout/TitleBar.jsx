import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IoLogOutOutline,
  IoPersonCircleOutline,
  IoSearchOutline,
  IoSettingsOutline,
  IoInformationCircleOutline,
} from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, DropdownMenu } from '../../components/ui';
import { CommandPalette } from './CommandPalette';
import { Logo } from './Logo';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

export function TitleBar() {
  const { userId, account, auth0User, logout } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigate = useNavigate();

  useKeyboardShortcut('mod+k', () => setPaletteOpen(true));

  const displayName = account?.nickname || account?.username || auth0User?.name || 'You';

  return (
    <>
      <header className="glass relative flex h-titlebar shrink-0 items-center gap-3 border-b border-border-subtle bg-titlebar px-3">
        <Link to="/home" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-fg">
          <Logo size={20} />
          <span className="hidden sm:inline">
            Code<span className="text-accent-border">Connect</span>
          </span>
        </Link>

        {/* Command palette trigger, centred like a VS Code quick-open bar. */}
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="group mx-auto flex h-7 w-full max-w-md items-center gap-2 rounded-md border border-border bg-inset px-2.5 text-xs text-fg-subtle transition-all duration-fast hover:border-accent-border/60 hover:text-fg-muted hover:shadow-[var(--glow-accent-sm)]"
        >
          <IoSearchOutline aria-hidden="true" className="text-sm" />
          <span>Go to anything…</span>
          <kbd className="ml-auto rounded border border-border bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
            Ctrl K
          </kbd>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-xs text-fg-muted md:inline">{displayName}</span>
          <DropdownMenu
            trigger={
              <Avatar
                name={account?.username ?? displayName}
                src={account?.picture || auth0User?.picture}
                size="sm"
                className="transition-transform duration-fast hover:scale-105"
              />
            }
            items={[
              {
                id: 'profile',
                label: 'My profile',
                icon: <IoPersonCircleOutline />,
                onSelect: () => navigate(userId ? `/u/${userId}` : '/home'),
              },
              {
                id: 'settings',
                label: 'Settings',
                icon: <IoSettingsOutline />,
                onSelect: () => navigate('/settings'),
              },
              {
                id: 'about',
                label: 'About CodeConnect',
                icon: <IoInformationCircleOutline />,
                onSelect: () => navigate('/about'),
              },
              { id: 'div', divider: true },
              { id: 'logout', label: 'Sign out', icon: <IoLogOutOutline />, danger: true, onSelect: logout },
            ]}
          />
        </div>
      </header>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
