import { Link, NavLink, Outlet } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { Backdrop } from './Backdrop';
import { Logo } from './Logo';
import { Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

const LINKS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/about', label: 'About' },
];

/**
 * Chrome for the two pages an anonymous visitor can reach. Deliberately not
 * the IDE shell — there is no workspace to frame yet, and showing an activity
 * rail full of links that all bounce to sign-in is worse than showing none.
 */
export function PublicShell() {
  const { isAuthenticated, loginWithGoogle } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col bg-base-solid">
      <Backdrop />

      <header className="glass sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-titlebar px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-sm font-semibold tracking-tight text-fg">
            Code<span className="text-accent-border">Connect</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-fast',
                  isActive ? 'bg-accent-soft text-accent-border' : 'text-fg-muted hover:bg-elevated hover:text-fg',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link to="/home">
              <Button size="sm">Open workspace</Button>
            </Link>
          ) : (
            <Button size="sm" onClick={loginWithGoogle}>
              Sign in
            </Button>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-border-subtle px-6 py-5 text-center text-xs text-fg-subtle">
        CodeConnect — practise, compete, and get unstuck together.
      </footer>
    </div>
  );
}
