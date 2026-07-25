import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { api } from '../lib/api';
import { readStorage, removeStorage, writeStorage } from '../lib/storage';

const ACCOUNT_KEY = 'codeconnect:account';

/**
 * Identity for the whole app.
 *
 * Auth0 owns the credential half — there is no password field anywhere in this
 * codebase, and no local login form. This provider owns the second half:
 * mapping the authenticated identity onto the CodeConnect account row.
 *
 * The mapping is a single idempotent POST /user/sync. It runs once per
 * authenticated session (guarded by syncedFor) and its result is mirrored into
 * localStorage so a reload paints the signed-in shell immediately instead of
 * flashing the landing page while Auth0 rehydrates.
 */
const AuthContext = createContext(null);

/** localStorage snapshot of the account, so a reload doesn't flash logged-out. */
function readCachedAccount() {
  const cached = readStorage(ACCOUNT_KEY, null);
  if (!cached || typeof cached !== 'object' || !cached._id) return null;
  return cached;
}

export function AuthProvider({ children }) {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading: auth0Loading,
    loginWithRedirect,
    logout: auth0Logout,
    error: auth0Error,
  } = useAuth0();

  const [account, setAccount] = useState(readCachedAccount);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Which email we've already synced this session. Without this the effect
  // re-fires every time `account` changes and loops against the server.
  const syncedFor = useRef(null);

  useEffect(() => {
    if (auth0Loading) return undefined;

    if (!isAuthenticated) {
      // Signed out (or never signed in): drop every trace of the account.
      syncedFor.current = null;
      if (account !== null) {
        setAccount(null);
        removeStorage(ACCOUNT_KEY);
      }
      return undefined;
    }

    const email = auth0User?.email;
    if (!email || syncedFor.current === email) return undefined;

    syncedFor.current = email;
    let cancelled = false;
    setSyncing(true);
    setSyncError(null);

    api.users
      .sync({ email, name: auth0User.name || auth0User.nickname, picture: auth0User.picture })
      .then(({ user }) => {
        if (cancelled) return;
        setAccount(user);
        writeStorage(ACCOUNT_KEY, user);
      })
      .catch((err) => {
        if (cancelled) return;
        // Allow a retry on the next render pass rather than wedging the
        // session in a half-authenticated state.
        syncedFor.current = null;
        setSyncError(err);
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, auth0Loading, auth0User, account]);

  /**
   * Straight to the provider's consent screen — no interstitial login page.
   * `connection` skips Auth0's own account picker for the one-click buttons.
   */
  const login = useCallback(
    (connection) =>
      loginWithRedirect({
        authorizationParams: connection ? { connection } : undefined,
        appState: { returnTo: `${window.location.pathname}${window.location.search}` },
      }),
    [loginWithRedirect],
  );

  const logout = useCallback(() => {
    syncedFor.current = null;
    setAccount(null);
    removeStorage(ACCOUNT_KEY);
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  }, [auth0Logout]);

  /** Lets profile edits update the cached account without a round trip. */
  const patchAccount = useCallback((patch) => {
    setAccount((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      writeStorage(ACCOUNT_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      account,
      userId: account?._id ?? null,
      auth0User,
      isAuthenticated,
      // A cached account means the shell can render straight away; only treat
      // the session as "loading" when there is nothing to show yet.
      isLoading: (auth0Loading || syncing) && !account,
      isSyncing: syncing,
      error: auth0Error ?? syncError,
      login,
      loginWithGoogle: () => login('google-oauth2'),
      loginWithGithub: () => login('github'),
      logout,
      patchAccount,
    }),
    [account, auth0User, isAuthenticated, auth0Loading, syncing, auth0Error, syncError, login, logout, patchAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
