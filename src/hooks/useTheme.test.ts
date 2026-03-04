import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';
import { useSettingStore } from '../store';

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

describe('useTheme', () => {
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

  it('should return system theme when theme is "system"', () => {
    window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia(true));

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('should return light theme when system prefers light', () => {
    window.matchMedia = vi.fn().mockReturnValue(mockMatchMedia(false));

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('should return correct theme when set to "dark"', () => {
    useSettingStore.getState().updateSettings({ theme: 'dark' });

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('should return correct theme when set to "light"', () => {
    useSettingStore.getState().updateSettings({ theme: 'light' });

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('should toggle theme from light to dark', () => {
    useSettingStore.getState().updateSettings({ theme: 'light' });

    const { result } = renderHook(() => useTheme());

    expect(result.current.resolvedTheme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    useSettingStore.getState().updateSettings({ theme: 'dark' });

    const { result } = renderHook(() => useTheme());

    expect(result.current.resolvedTheme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.resolvedTheme).toBe('light');
  });

  it('should set theme using setTheme', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('should apply theme to document element', () => {
    useSettingStore.getState().updateSettings({ theme: 'dark' });

    renderHook(() => useTheme());

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should apply light theme to document element', () => {
    useSettingStore.getState().updateSettings({ theme: 'light' });

    renderHook(() => useTheme());

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
