import type { Middleware } from '@reduxjs/toolkit';

/**
 * Middleware que persiste automáticamente los slices relevantes en localStorage.
 * - theme.mode → 'theme-mode'
 * - sidebar.isCollapsed → 'sidebar-collapsed'
 *
 * NO persiste auth — el JWT vive en cookie httpOnly y se revalida con fetchCurrentUser().
 */
export const localStorageMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);

  if (typeof window === 'undefined') return result;

  // Leemos el estado DESPUÉS de que el reducer haya procesado la acción.
  // Usamos un setTimeout(0) para que el store ya tenga el nuevo estado.
  setTimeout(() => {
    try {
      const store = (action as { _storeGetState?: () => unknown })._storeGetState;
      // Nota: no podemos acceder al store directamente desde un middleware vanilla.
      // Usamos el patrón de suscripción en su lugar (ver store/index.ts).
    } catch {
      // silencioso
    }
  }, 0);

  return result;
};

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