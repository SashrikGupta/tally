import { Auth0Provider } from '@auth0/auth0-react';
import { ToastProvider } from '../contexts/ToastContext';
import { AuthProvider } from '../contexts/AuthContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { setReturnTo } from '../lib/storage';

const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;

/**
 * Runs once when Auth0 hands control back after the provider redirect.
 *
 * Two jobs: strip `?code=&state=` out of the address bar, and stash where the
 * user was headed. The redirect target itself is applied by Landing, not here
 * — see the note on setReturnTo in lib/storage.
 */
function onRedirectCallback(appState) {
  setReturnTo(appState?.returnTo);
  window.history.replaceState({}, document.title, window.location.pathname);
}

export function Providers({ children }) {
  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: window.location.origin }}
      // localStorage (not the default in-memory cache) so a refresh or a new
      // tab keeps the session. Refresh tokens keep it alive past the access
      // token's lifetime without bouncing the user through a redirect.
      cacheLocation="localstorage"
      useRefreshTokens
      onRedirectCallback={onRedirectCallback}
    >
      <ToastProvider>
        <SettingsProvider>
          <AuthProvider>{children}</AuthProvider>
        </SettingsProvider>
      </ToastProvider>
    </Auth0Provider>
  );
}
