import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { IoLockClosedOutline } from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { Button, Spinner, ErrorState } from '../components/ui';
import { setReturnTo } from '../lib/storage';

/**
 * The access-management boundary.
 *
 * Used as a layout route, so everything nested under it is private by
 * construction — a new feature route is gated by default and has to be moved
 * out of the subtree to become public. That's the opposite of remembering to
 * wrap each new screen, which is how routes end up accidentally exposed.
 *
 * Also accepts children for the handful of places that need to gate a subtree
 * of an already-protected page.
 */
export function RequireAuth({ children }) {
  const { isAuthenticated, isLoading, isSyncing, userId, error } = useAuth();
  const location = useLocation();

  // Remember the destination before the provider redirect takes the page away.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) setReturnTo(`${location.pathname}${location.search}`);
  }, [isLoading, isAuthenticated, location]);

  if (isLoading) return <AuthPending message="Restoring your session…" />;

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // Authenticated with Auth0 but the account row failed to resolve. Surfacing
  // this beats an indefinite spinner — it's almost always the API being down.
  if (!userId && error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState
          title="Could not load your account"
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!userId) {
    return <AuthPending message={isSyncing ? 'Setting up your account…' : 'Signing you in…'} />;
  }

  return children ?? <Outlet />;
}

function AuthPending({ message }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 py-24">
      <Spinner size={26} className="text-accent-border" />
      <p className="text-sm text-fg-muted">{message}</p>
    </div>
  );
}

/**
 * Inline prompt for actions that need an account on an otherwise public page.
 * Distinct from RequireAuth: it never navigates, it just asks.
 */
export function SignInPrompt({ title = 'Sign in to continue', description, className }) {
  const { loginWithGoogle } = useAuth();
  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-elevated p-8 text-center">
        <IoLockClosedOutline className="text-3xl text-accent-border" aria-hidden="true" />
        <h3 className="font-semibold text-fg">{title}</h3>
        {description && <p className="max-w-sm text-sm text-fg-muted">{description}</p>}
        <Button onClick={loginWithGoogle} className="mt-1">
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
