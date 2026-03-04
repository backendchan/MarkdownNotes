import { create } from 'zustand';
import type { AppState, SortOption, DateRange } from '../types';
import { defaultAppState } from '../types';

interface UIStore {
  appState: AppState;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SortOption) => void;
  toggleSidebar: () => void;
  setEditorMode: (mode: 'split' | 'editor' | 'preview') => void;
  setAppState: (state: AppState) => void;
  setSelectedTag: (tag: string | null) => void;
  setSelectedTags: (tags: string[]) => void;
  setDateRange: (range: DateRange) => void;
  toggleAdvancedSearch: () => void;
  clearSearchFilters: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  appState: defaultAppState,

  setSearchQuery: (query) =>
    set((state) => ({
      appState: { ...state.appState, searchQuery: query },
    })),

  setSortBy: (sortBy) =>
    set((state) => ({
      appState: { ...state.appState, sortBy },
    })),

  toggleSidebar: () =>
    set((state) => ({
      appState: { ...state.appState, isSidebarCollapsed: !state.appState.isSidebarCollapsed },
    })),

  setEditorMode: (mode) =>
    set((state) => ({
      appState: { ...state.appState, editorMode: mode },
    })),

  setAppState: (appState) => set({ appState }),

  setSelectedTag: (tag) =>
    set((state) => ({
      appState: { ...state.appState, selectedTag: tag },
    })),

  setSelectedTags: (tags) =>
    set((state) => ({
      appState: { ...state.appState, selectedTags: tags },
    })),

  setDateRange: (range) =>
    set((state) => ({
      appState: { ...state.appState, dateRange: range },
    })),

  toggleAdvancedSearch: () =>
    set((state) => ({
      appState: { ...state.appState, isAdvancedSearch: !state.appState.isAdvancedSearch },
    })),

  clearSearchFilters: () =>
    set((state) => ({
      appState: {
        ...state.appState,
        searchQuery: '',
        selectedTag: null,
        selectedTags: [],
        dateRange: { start: null, end: null },
      },
    })),
}));
