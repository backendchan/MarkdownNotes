import { useEffect, useCallback } from 'react';
import { useSettingStore } from '../store';

type Theme = 'light' | 'dark';

const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: Theme): void => {
  document.documentElement.setAttribute('data-theme', theme);
};

export const useTheme = () => {
  const { settings, updateSettings } = useSettingStore();

  const resolvedTheme: Theme = settings.theme === 'system' 
    ? getSystemTheme() 
    : settings.theme;

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      applyTheme(getSystemTheme());
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  }, [updateSettings]);

  const toggleTheme = useCallback(() => {
    const nextTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  return {
    theme: settings.theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
};
