import { useEffect, type ReactNode } from 'react';
import { useSettingStore } from '../../../store';

type Theme = 'light' | 'dark';

const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: Theme): void => {
  document.documentElement.setAttribute('data-theme', theme);
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { settings } = useSettingStore();

  useEffect(() => {
    const resolvedTheme: Theme = settings.theme === 'system' 
      ? getSystemTheme() 
      : settings.theme;
    applyTheme(resolvedTheme);
  }, [settings.theme]);

  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      applyTheme(getSystemTheme());
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  return <>{children}</>;
};
