import type { SortOption } from './note';

export interface DateRange {
  start: number | null;
  end: number | null;
}

export interface AppState {
  currentNoteId: string | null;
  searchQuery: string;
  sortBy: SortOption;
  isSidebarCollapsed: boolean;
  editorMode: 'split' | 'editor' | 'preview';
  selectedTag: string | null;
  selectedTags: string[];
  dateRange: DateRange;
  isAdvancedSearch: boolean;
}

export const defaultAppState: AppState = {
  currentNoteId: null,
  searchQuery: '',
  sortBy: 'updatedAt',
  isSidebarCollapsed: false,
  editorMode: 'split',
  selectedTag: null,
  selectedTags: [],
  dateRange: { start: null, end: null },
  isAdvancedSearch: false,
};
