


/**
 * Middleware que persiste automáticamente los slices relevantes en localStorage.
 * - theme.mode → 'theme-mode'
 * - sidebar.isCollapsed → 'sidebar-collapsed'
 *
 * NO persiste auth — el JWT vive en cookie httpOnly y se revalida con fetchCurrentUser().
 */


/**
 * Suscriptor del store encargado de persistir en localStorage.
 * Se conecta en store/index.ts con store.subscribe().
 */
export function createLocalStoragePersister(getState: () => { theme: { mode: string }; sidebar: { isCollapsed: boolean } }) {
  let previousMode = '';
  let previousCollapsed = false;

  return () => {
    const state = getState();

    if (state.theme.mode !== previousMode) {
      previousMode = state.theme.mode;
      localStorage.setItem('theme-mode', state.theme.mode);
    }

    if (state.sidebar.isCollapsed !== previousCollapsed) {
      previousCollapsed = state.sidebar.isCollapsed;
      localStorage.setItem('sidebar-collapsed', String(state.sidebar.isCollapsed));
    }
  };
}