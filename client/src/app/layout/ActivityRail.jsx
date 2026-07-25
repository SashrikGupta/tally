import { NavLink } from 'react-router-dom';
import {
  IoFlashOutline,
  IoTrophyOutline,
  IoHelpBuoyOutline,
  IoCodeSlashOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoSettingsOutline,
  IoHomeOutline,
} from 'react-icons/io5';
import { cn } from '../../lib/cn';
import { Tooltip } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

const PRIMARY = [
  { to: '/home', label: 'Home', icon: IoHomeOutline },
  { to: '/problems', label: 'Arena', icon: IoFlashOutline },
  { to: '/contests', label: 'Battle', icon: IoTrophyOutline },
  { to: '/queries', label: 'Queries', icon: IoHelpBuoyOutline },
  { to: '/playground', label: 'Playground', icon: IoCodeSlashOutline },
  { to: '/connect', label: 'Connect', icon: IoPeopleOutline },
];

export function ActivityRail() {
  const { userId } = useAuth();

  return (
    <nav
      aria-label="Primary"
      className="glass flex w-rail shrink-0 flex-col items-center justify-between border-r border-border-subtle bg-rail py-2"
    >
      <div className="flex flex-col items-center gap-1">
        {PRIMARY.map((item) => (
          <RailLink key={item.to} {...item} />
        ))}
      </div>
      <div className="flex flex-col items-center gap-1">
        {userId && <RailLink to={`/u/${userId}`} label="Profile" icon={IoPersonOutline} />}
        <RailLink to="/settings" label="Settings" icon={IoSettingsOutline} />
      </div>
    </nav>
  );
}

function RailLink({ to, label, icon: Icon }) {
  return (
    <Tooltip label={label} side="right">
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            'group relative flex h-10 w-10 items-center justify-center rounded-md text-xl',
            'transition-all duration-base ease-out',
            isActive
              ? 'bg-accent-soft text-accent-border shadow-[var(--glow-accent-sm)]'
              : 'text-fg-subtle hover:bg-elevated hover:text-fg',
          )
        }
      >
        {({ isActive }) => (
          <>
            {/* The active indicator bar VS Code puts on the rail edge. */}
            <span
              className={cn(
                'absolute -left-2 h-5 w-0.5 rounded-full bg-accent-border transition-all duration-base ease-spring',
                isActive ? 'scale-y-100 opacity-100 shadow-[var(--glow-accent-sm)]' : 'scale-y-0 opacity-0',
              )}
              aria-hidden="true"
            />
            <Icon aria-hidden="true" className="transition-transform duration-fast group-hover:scale-110" />
            <span className="sr-only">{label}</span>
          </>
        )}
      </NavLink>
    </Tooltip>
  );
}
