import type { SortOption } from './note';
import type { SortDirection } from '../utils/sort';

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  editorFontSize: number;
  editorFontFamily: string;
  previewFontSize: number;
  autoSaveInterval: number;
  defaultSort: SortOption;
  sortDirection: SortDirection;
  showLineNumbers: boolean;
  syncScroll: boolean;
  layoutRatio: [number, number, number];
  editorWidth: number;
  sidebarWidth: number;
}

export const defaultSettings: Settings = {
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
};
