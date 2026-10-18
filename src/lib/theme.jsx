import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { THEMES, DEFAULT_THEME, DARK_THEME, normalizeThemeKey, themeByKey } from '@/lib/themes';

const ThemeContext = createContext();

const STORAGE_KEY = 'aman-tracker-theme';

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => {
    try {
      return normalizeThemeKey(localStorage.getItem(STORAGE_KEY)) || DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  const theme = themeByKey(themeKey);
  const mode = theme.mode;

  // One attribute drives every palette variable in index.css, and the `dark`
  // class keeps the shadcn primitives (dialogs, toasts) in step.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = themeKey;
    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;
    try {
      localStorage.setItem(STORAGE_KEY, themeKey);
    } catch { /* storage unavailable */ }
  }, [themeKey, mode]);

  const setTheme = useCallback((key) => {
    const normalized = normalizeThemeKey(key);
    if (normalized) setThemeKey(normalized);
  }, []);

  // The top-bar toggle only ever moves between the two default themes; picking
  // any other theme in Settings leaves the toggle on the matching light/dark
  // side of that pair.
  const toggleTheme = useCallback(() => {
    setThemeKey((current) => (themeByKey(current).mode === 'dark' ? DEFAULT_THEME : DARK_THEME));
  }, []);

  const value = useMemo(
    () => ({ themeKey, theme, mode, themes: THEMES, setTheme, toggleTheme }),
    [themeKey, theme, mode, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}