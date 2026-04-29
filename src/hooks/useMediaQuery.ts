import { useState, useEffect } from 'react';

/**
 * Reactive media query hook.
 * Returns `true` when the provided CSS media query matches the viewport.
 *
 * @param query - CSS media query string (e.g. `'(min-width: 1024px)'`).
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}