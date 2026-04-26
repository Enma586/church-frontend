import { useMemo, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTheme, toggleTheme, type ThemeMode } from '@/store/slices/themeSlice';

function applyClass(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
}

export function useTheme() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  // Side-effect: aplicar clase al <html> + persistir en localStorage
  useEffect(() => {
    applyClass(mode);
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      isLight: mode === 'light',
      opposite: (mode === 'light' ? 'dark' : 'light') as ThemeMode,
    }),
    [mode],
  );

  const toggle = useCallback(() => dispatch(toggleTheme()), [dispatch]);
  const set = useCallback((m: ThemeMode) => dispatch(setTheme(m)), [dispatch]);

  return { ...value, toggle, set } as const;
}