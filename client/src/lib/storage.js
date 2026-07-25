/** Thin, failure-safe localStorage wrapper — private/incognito mode must not crash the app. */
export function readStorage(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/*
 * Where to land after an Auth0 round trip.
 *
 * This can't ride on the URL: Auth0 always returns to the origin, and the
 * router's initial location is captured before onRedirectCallback runs, so
 * rewriting the path there would never be observed. sessionStorage bridges the
 * redirect instead, and Landing consumes it exactly once.
 */
const RETURN_TO_KEY = 'codeconnect:returnTo';

export function setReturnTo(path) {
  try {
    if (path && path !== '/') window.sessionStorage.setItem(RETURN_TO_KEY, path);
  } catch {
    /* ignore */
  }
}

export function takeReturnTo() {
  try {
    const value = window.sessionStorage.getItem(RETURN_TO_KEY);
    window.sessionStorage.removeItem(RETURN_TO_KEY);
    // Same-origin paths only — this value ends up in a router navigation.
    return value && value.startsWith('/') && !value.startsWith('//') ? value : null;
  } catch {
    return null;
  }
}
