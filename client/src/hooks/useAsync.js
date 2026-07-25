import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Standard data-fetching hook. Every screen that loads data uses this and
 * handles all four resulting states — loading / error / empty / success.
 * See Context/01-architecture.md for the canonical usage pattern.
 *
 * `fn` should be a stable callback (wrap with useCallback, or pass a fresh
 * arrow function and list its real dependencies in `deps`).
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const requestId = useRef(0);

  const run = useCallback(() => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fn)
      .then((data) => {
        if (id === requestId.current) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (id === requestId.current) setState({ data: null, loading: false, error });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { ...state, refetch: run };
}
