import { describe, it, expect } from 'vitest';
import { sortNotes, sortOptionLabels, sortDirectionLabels, type SortConfig } from './sort';
import type { Note } from '../types';

const createMockNote = (overrides: Partial<Note>): Note => ({
  id: '1',
  title: 'Test Note',
  content: 'Test content',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

describe('sortNotes', () => {
  const notes: Note[] = [
    createMockNote({
      id: '1',
      title: 'Alpha',
      createdAt: 1000,
      updatedAt: 3000,
    }),
    createMockNote({
      id: '2',
      title: 'Beta',
      createdAt: 2000,
      updatedAt: 2000,
    }),
    createMockNote({
      id: '3',
      title: 'Gamma',
      createdAt: 3000,
      updatedAt: 1000,
    }),
  ];

  describe('sortBy createdAt', () => {
    it('should sort by createdAt ascending', () => {
      const config: SortConfig = { option: 'createdAt', direction: 'asc' };
      const result = sortNotes(notes, config);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
    });

    it('should sort by createdAt descending', () => {
      const config: SortConfig = { option: 'createdAt', direction: 'desc' };
      const result = sortNotes(notes, config);
      expect(result[0].id).toBe('3');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('1');
    });
  });

  describe('sortBy updatedAt', () => {
    it('should sort by updatedAt ascending', () => {
      const config: SortConfig = { option: 'updatedAt', direction: 'asc' };
      const result = sortNotes(notes, config);
      expect(result[0].id).toBe('3');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('1');
    });

    it('should sort by updatedAt descending', () => {
      const config: SortConfig = { option: 'updatedAt', direction: 'desc' };
      const result = sortNotes(notes, config);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
    });
  });

  describe('sortBy title', () => {
    it('should sort by title ascending', () => {
      const config: SortConfig = { option: 'title', direction: 'asc' };
      const result = sortNotes(notes, config);
      expect(result[0].title).toBe('Alpha');
      expect(result[1].title).toBe('Beta');
      expect(result[2].title).toBe('Gamma');
    });

    it('should sort by title descending', () => {
      const config: SortConfig = { option: 'title', direction: 'desc' };
      const result = sortNotes(notes, config);
      expect(result[0].title).toBe('Gamma');
      expect(result[1].title).toBe('Beta');
      expect(result[2].title).toBe('Alpha');
    });
  });

  describe('pinned notes', () => {
    const notesWithPinned: Note[] = [
      createMockNote({
        id: '1',
        title: 'Unpinned A',
        updatedAt: 3000,
      }),
      createMockNote({
        id: '2',
        title: 'Pinned A',
        updatedAt: 2000,
        isPinned: true,
      }),
      createMockNote({
        id: '3',
        title: 'Unpinned B',
        updatedAt: 1000,
      }),
      createMockNote({
        id: '4',
        title: 'Pinned B',
        updatedAt: 4000,
        isPinned: true,
      }),
    ];

    it('should place pinned notes at the top', () => {
      const config: SortConfig = { option: 'updatedAt', direction: 'desc' };
      const result = sortNotes(notesWithPinned, config);
      expect(result[0].isPinned).toBe(true);
      expect(result[1].isPinned).toBe(true);
      expect(result[2].isPinned).toBeUndefined();
      expect(result[3].isPinned).toBeUndefined();
    });

    it('should sort pinned notes among themselves', () => {
      const config: SortConfig = { option: 'updatedAt', direction: 'desc' };
      const result = sortNotes(notesWithPinned, config);
      expect(result[0].id).toBe('4');
      expect(result[1].id).toBe('2');
    });

    it('should sort unpinned notes among themselves', () => {
      const config: SortConfig = { option: 'updatedAt', direction: 'desc' };
      const result = sortNotes(notesWithPinned, config);
      expect(result[2].id).toBe('1');
      expect(result[3].id).toBe('3');
    });
  });

  describe('edge cases', () => {
    it('should return empty array for empty input', () => {
      const config: SortConfig = { option: 'updatedAt', direction: 'desc' };
      const result = sortNotes([], config);
      expect(result).toEqual([]);
    });

    it('should handle single note', () => {
      const singleNote = [notes[0]];
      const config: SortConfig = { option: 'updatedAt', direction: 'desc' };
      const result = sortNotes(singleNote, config);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });
});

describe('sortOptionLabels', () => {
  it('should have labels for all sort options', () => {
    expect(sortOptionLabels.createdAt).toBe('创建时间');
    expect(sortOptionLabels.updatedAt).toBe('更新时间');
    expect(sortOptionLabels.title).toBe('标题');
  });
});

describe('sortDirectionLabels', () => {
  it('should have labels for all sort directions', () => {
    expect(sortDirectionLabels.asc).toBe('升序');
    expect(sortDirectionLabels.desc).toBe('降序');
  });
});
