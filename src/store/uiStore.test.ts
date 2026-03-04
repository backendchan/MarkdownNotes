import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

describe('uiStore - Advanced Search', () => {
  beforeEach(() => {
    useUIStore.setState({
      appState: {
        currentNoteId: null,
        searchQuery: '',
        sortBy: 'updatedAt',
        isSidebarCollapsed: false,
        editorMode: 'split',
        selectedTag: null,
        selectedTags: [],
        dateRange: { start: null, end: null },
        isAdvancedSearch: false,
      },
    });
  });

  describe('setSelectedTags', () => {
    it('should set selected tags', () => {
      const { setSelectedTags } = useUIStore.getState();
      setSelectedTags(['tag1', 'tag2']);

      expect(useUIStore.getState().appState.selectedTags).toEqual(['tag1', 'tag2']);
    });

    it('should replace existing tags', () => {
      const { setSelectedTags } = useUIStore.getState();
      setSelectedTags(['tag1']);
      setSelectedTags(['tag2', 'tag3']);

      expect(useUIStore.getState().appState.selectedTags).toEqual(['tag2', 'tag3']);
    });

    it('should clear tags with empty array', () => {
      const { setSelectedTags } = useUIStore.getState();
      setSelectedTags(['tag1']);
      setSelectedTags([]);

      expect(useUIStore.getState().appState.selectedTags).toEqual([]);
    });
  });

  describe('setDateRange', () => {
    it('should set date range', () => {
      const { setDateRange } = useUIStore.getState();
      const start = Date.now() - 86400000;
      const end = Date.now();

      setDateRange({ start, end });

      expect(useUIStore.getState().appState.dateRange.start).toBe(start);
      expect(useUIStore.getState().appState.dateRange.end).toBe(end);
    });

    it('should clear date range', () => {
      const { setDateRange } = useUIStore.getState();
      setDateRange({ start: Date.now(), end: Date.now() });
      setDateRange({ start: null, end: null });

      expect(useUIStore.getState().appState.dateRange.start).toBeNull();
      expect(useUIStore.getState().appState.dateRange.end).toBeNull();
    });

    it('should allow partial date range', () => {
      const { setDateRange } = useUIStore.getState();
      const start = Date.now();

      setDateRange({ start, end: null });

      expect(useUIStore.getState().appState.dateRange.start).toBe(start);
      expect(useUIStore.getState().appState.dateRange.end).toBeNull();
    });
  });

  describe('toggleAdvancedSearch', () => {
    it('should toggle isAdvancedSearch', () => {
      const { toggleAdvancedSearch } = useUIStore.getState();

      expect(useUIStore.getState().appState.isAdvancedSearch).toBe(false);

      toggleAdvancedSearch();
      expect(useUIStore.getState().appState.isAdvancedSearch).toBe(true);

      toggleAdvancedSearch();
      expect(useUIStore.getState().appState.isAdvancedSearch).toBe(false);
    });
  });

  describe('clearSearchFilters', () => {
    it('should clear all search filters', () => {
      const { setSearchQuery, setSelectedTags, setDateRange, clearSearchFilters } =
        useUIStore.getState();

      setSearchQuery('test query');
      setSelectedTags(['tag1', 'tag2']);
      setDateRange({ start: Date.now(), end: Date.now() });

      clearSearchFilters();

      const { appState } = useUIStore.getState();
      expect(appState.searchQuery).toBe('');
      expect(appState.selectedTag).toBeNull();
      expect(appState.selectedTags).toEqual([]);
      expect(appState.dateRange.start).toBeNull();
      expect(appState.dateRange.end).toBeNull();
    });

    it('should not affect other app state', () => {
      const { setAppState, clearSearchFilters } = useUIStore.getState();

      setAppState({
        ...useUIStore.getState().appState,
        currentNoteId: 'note-123',
        isSidebarCollapsed: true,
      });

      clearSearchFilters();

      const { appState } = useUIStore.getState();
      expect(appState.currentNoteId).toBe('note-123');
      expect(appState.isSidebarCollapsed).toBe(true);
    });
  });

  describe('setSearchQuery', () => {
    it('should set search query', () => {
      const { setSearchQuery } = useUIStore.getState();
      setSearchQuery('test search');

      expect(useUIStore.getState().appState.searchQuery).toBe('test search');
    });

    it('should clear search query with empty string', () => {
      const { setSearchQuery } = useUIStore.getState();
      setSearchQuery('test');
      setSearchQuery('');

      expect(useUIStore.getState().appState.searchQuery).toBe('');
    });
  });

  describe('setSelectedTag', () => {
    it('should set selected tag', () => {
      const { setSelectedTag } = useUIStore.getState();
      setSelectedTag('important');

      expect(useUIStore.getState().appState.selectedTag).toBe('important');
    });

    it('should clear selected tag with null', () => {
      const { setSelectedTag } = useUIStore.getState();
      setSelectedTag('important');
      setSelectedTag(null);

      expect(useUIStore.getState().appState.selectedTag).toBeNull();
    });
  });
});
