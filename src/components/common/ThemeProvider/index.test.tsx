import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider } from './index';
import { useSettingStore } from '../../../store';

const mockMatchMedia = (matches: boolean) => ({
  matches,
  media: '(prefers-color-scheme: dark)',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe('ThemeProvider', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia(false));
    useSettingStore.setState({
      settings: {
        theme: 'system',
        editorFontSize: 14,
        editorFontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        previewFontSize: 16,
        autoSaveInterval: 1000,
        defaultSort: 'updatedAt',
        sortDirection: 'desc',
        showLineNumbers: true,
        syncScroll: true,
        layoutRatio: [25, 35, 40],
        editorWidth: 500,
        sidebarWidth: 280,
      },
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.documentElement.removeAttribute('data-theme');
  });

  it('should render children', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply light theme when theme is "light"', () => {
    useSettingStore.getState().updateSettings({ theme: 'light' });

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should apply dark theme when theme is "dark"', () => {
    useSettingStore.getState().updateSettings({ theme: 'dark' });

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should apply system theme when theme is "system" and system prefers light', () => {
    window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia(false));

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should apply system theme when theme is "system" and system prefers dark', () => {
    window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia(true));

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should listen to system theme changes when theme is "system"', () => {
    const listeners: Array<() => void> = [];
    const mockMediaQuery = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_event: string, listener: () => void) => {
        listeners.push(listener);
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    window.matchMedia = vi.fn().mockReturnValue(mockMediaQuery);

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should not listen to system theme changes when theme is not "system"', () => {
    useSettingStore.getState().updateSettings({ theme: 'dark' });
    const mockMediaQuery = mockMatchMedia(false);
    window.matchMedia = vi.fn().mockReturnValue(mockMediaQuery);

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(mockMediaQuery.addEventListener).not.toHaveBeenCalled();
  });

  it('should update theme when settings change', () => {
    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    act(() => {
      useSettingStore.getState().updateSettings({ theme: 'dark' });
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
