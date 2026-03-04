import type { Note, SortOption } from '../types';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  option: SortOption;
  direction: SortDirection;
}

export const sortNotes = (notes: Note[], config: SortConfig): Note[] => {
  const { option, direction } = config;
  const multiplier = direction === 'asc' ? 1 : -1;

  const pinnedNotes = notes.filter((note) => note.isPinned);
  const unpinnedNotes = notes.filter((note) => !note.isPinned);

  const sortByOption = (a: Note, b: Note): number => {
    switch (option) {
      case 'createdAt':
        return (a.createdAt - b.createdAt) * multiplier;
      case 'updatedAt':
        return (a.updatedAt - b.updatedAt) * multiplier;
      case 'title':
        return a.title.localeCompare(b.title, 'zh-CN') * multiplier;
      default:
        return 0;
    }
  };

  const sortedPinned = [...pinnedNotes].sort(sortByOption);
  const sortedUnpinned = [...unpinnedNotes].sort(sortByOption);

  return [...sortedPinned, ...sortedUnpinned];
};

export const sortOptionLabels: Record<SortOption, string> = {
  createdAt: '创建时间',
  updatedAt: '更新时间',
  title: '标题',
};

export const sortDirectionLabels: Record<SortDirection, string> = {
  asc: '升序',
  desc: '降序',
};
