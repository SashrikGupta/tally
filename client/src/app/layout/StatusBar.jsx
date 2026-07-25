import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoCloudOfflineOutline, IoColorPaletteOutline, IoFlashOutline, IoRadioButtonOn } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { THEMES } from '../../lib/constants';

/** Tracks browser connectivity so the bar can say when the app is offline. */
function useOnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}

export function StatusBar() {
  const { account } = useAuth();
  const { settings } = useSettings();
  const online = useOnlineStatus();

  const themeLabel = THEMES.find((t) => t.id === settings.appearance.theme)?.label ?? settings.appearance.theme;

  return (
    <footer className="glass flex h-statusbar shrink-0 items-center justify-between gap-4 border-t border-border-subtle bg-statusbar px-3 text-[11px] font-medium text-fg-accent">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          {online ? (
            <IoRadioButtonOn aria-hidden="true" className="text-[10px]" />
          ) : (
            <IoCloudOfflineOutline aria-hidden="true" />
          )}
          {online ? 'Connected' : 'Offline'}
        </span>
        {account && (
          <Link to={`/u/${account._id}`} className="flex items-center gap-1.5 hover:underline">
            <IoFlashOutline aria-hidden="true" />
            {account.points ?? 0} pts
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link to="/settings" className="flex items-center gap-1.5 hover:underline">
          <IoColorPaletteOutline aria-hidden="true" />
          {themeLabel}
        </Link>
        <span className="hidden sm:inline">{account?.username ?? 'CodeConnect'}</span>
      </div>
    </footer>
  );
}
