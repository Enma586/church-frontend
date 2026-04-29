import { useState, useCallback } from 'react';

/**
 * Generic pagination state manager used across all list pages.
 *
 * @param initialPage - Starting page (1-based).
 * @param initialLimit - Items per page.
 *
 * @example
 * const { page, limit, goToPage, setPerPage } = usePagination();
 */
export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  /** Navigate to a specific page. */
  const goToPage = useCallback((p: number) => setPage(p), []);

  /**
   * Change the number of items per page.
   * Automatically resets to page 1 to avoid out-of-range offsets.
   */
  const setPerPage = useCallback((l: number) => {
    setLimit(l);
    setPage(1);
  }, []);

  return { page, limit, goToPage, setPerPage };
}