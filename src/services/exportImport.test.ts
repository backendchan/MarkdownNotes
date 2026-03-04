import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportImportService } from './exportImport';
import type { Note } from '../types';

describe('exportImportService', () => {
  const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: 'This is test content\nwith multiple lines',
    createdAt: 1000000000000,
    updatedAt: 1000000000000,
  };

  let originalFileReader: typeof FileReader;

  beforeEach(() => {
    vi.clearAllMocks();
    originalFileReader = globalThis.FileReader;
  });

  afterEach(() => {
    globalThis.FileReader = originalFileReader;
  });

  describe('parseMarkdownFile', () => {
    it('should parse markdown with title', () => {
      const markdown = '# My Title\n\nThis is the content.';
      const result = exportImportService.parseMarkdownFile(markdown);

      expect(result.title).toBe('My Title');
      expect(result.content).toBe('This is the content.');
    });

    it('should parse markdown without title', () => {
      const markdown = 'This is content without a title.';
      const result = exportImportService.parseMarkdownFile(markdown);

      expect(result.title).toBe('');
      expect(result.content).toBe('This is content without a title.');
    });

    it('should handle empty content', () => {
      const markdown = '# Title Only';
      const result = exportImportService.parseMarkdownFile(markdown);

      expect(result.title).toBe('Title Only');
      expect(result.content).toBe('');
    });

    it('should handle title with no blank line after', () => {
      const markdown = '# Title\nContent starts immediately';
      const result = exportImportService.parseMarkdownFile(markdown);

      expect(result.title).toBe('Title');
      expect(result.content).toBe('Content starts immediately');
    });

    it('should handle multi-line content', () => {
      const markdown = '# Title\n\nLine 1\nLine 2\nLine 3';
      const result = exportImportService.parseMarkdownFile(markdown);

      expect(result.title).toBe('Title');
      expect(result.content).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('validateBackupData', () => {
    it('should validate correct backup data', () => {
      const data = {
        version: '1.0.0',
        exportedAt: Date.now(),
        notes: [],
      };

      expect(exportImportService.validateBackupData(data)).toBe(true);
    });

    it('should reject null data', () => {
      expect(exportImportService.validateBackupData(null)).toBe(false);
    });

    it('should reject data without version', () => {
      const data = {
        exportedAt: Date.now(),
        notes: [],
      };

      expect(exportImportService.validateBackupData(data)).toBe(false);
    });

    it('should reject data without notes array', () => {
      const data = {
        version: '1.0.0',
        exportedAt: Date.now(),
        notes: 'not an array',
      };

      expect(exportImportService.validateBackupData(data)).toBe(false);
    });

    it('should reject non-object data', () => {
      expect(exportImportService.validateBackupData('string')).toBe(false);
      expect(exportImportService.validateBackupData(123)).toBe(false);
    });
  });

  describe('exportNoteAsMarkdown', () => {
    it('should create download link with correct filename', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      exportImportService.exportNoteAsMarkdown(mockNote);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should use untitled for notes without title', () => {
      const noteWithoutTitle: Note = {
        ...mockNote,
        title: '',
      };

      const createElementSpy = vi.spyOn(document, 'createElement');
      exportImportService.exportNoteAsMarkdown(noteWithoutTitle);

      const linkElement = createElementSpy.mock.results[0].value;
      expect(linkElement.download).toBe('untitled.md');

      createElementSpy.mockRestore();
    });
  });

  describe('exportAllNotes', () => {
    it('should create JSON backup file', () => {
      const notes: Note[] = [mockNote];
      const createElementSpy = vi.spyOn(document, 'createElement');

      exportImportService.exportAllNotes(notes);

      const linkElement = createElementSpy.mock.results[0].value;
      expect(linkElement.download).toMatch(/markdown-notes-backup-\d{4}-\d{2}-\d{2}\.json/);

      createElementSpy.mockRestore();
    });
  });

  describe('importMarkdownFile', () => {
    const createMockFileReader = (result: string, shouldError = false) => {
      class MockFileReader {
        onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
        onerror: ((e: ProgressEvent<FileReader>) => void) | null = null;
        result: string | ArrayBuffer | null = result;

        readAsText() {
          setTimeout(() => {
            if (shouldError) {
              this.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>);
            } else {
              this.onload?.({
                target: { result: this.result },
              } as unknown as ProgressEvent<FileReader>);
            }
          }, 0);
        }
      }
      return MockFileReader;
    };

    it('should parse markdown file content', async () => {
      globalThis.FileReader = createMockFileReader('# Test Title\n\nTest content') as unknown as typeof FileReader;

      const file = new File(['# Test Title\n\nTest content'], 'test.md', {
        type: 'text/markdown',
      });

      const result = await exportImportService.importMarkdownFile(file);

      expect(result.title).toBe('Test Title');
      expect(result.content).toBe('Test content');
    });

    it('should reject on file read error', async () => {
      globalThis.FileReader = createMockFileReader('', true) as unknown as typeof FileReader;

      const file = new File([''], 'test.md', { type: 'text/markdown' });

      await expect(exportImportService.importMarkdownFile(file)).rejects.toThrow(
        'Failed to read file'
      );
    });
  });

  describe('importBackupFile', () => {
    const createMockFileReader = (result: string, shouldError = false) => {
      class MockFileReader {
        onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
        onerror: ((e: ProgressEvent<FileReader>) => void) | null = null;
        result: string | ArrayBuffer | null = result;

        readAsText() {
          setTimeout(() => {
            if (shouldError) {
              this.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>);
            } else {
              this.onload?.({
                target: { result: this.result },
              } as unknown as ProgressEvent<FileReader>);
            }
          }, 0);
        }
      }
      return MockFileReader;
    };

    it('should parse valid backup JSON', async () => {
      const backupData = {
        version: '1.0.0',
        exportedAt: Date.now(),
        notes: [mockNote],
      };

      globalThis.FileReader = createMockFileReader(JSON.stringify(backupData)) as unknown as typeof FileReader;

      const file = new File([JSON.stringify(backupData)], 'backup.json', {
        type: 'application/json',
      });

      const result = await exportImportService.importBackupFile(file);

      expect(result.version).toBe('1.0.0');
      expect(result.notes).toHaveLength(1);
      expect(result.notes[0].title).toBe('Test Note');
    });

    it('should reject invalid JSON', async () => {
      globalThis.FileReader = createMockFileReader('not valid json') as unknown as typeof FileReader;

      const file = new File(['not valid json'], 'backup.json', {
        type: 'application/json',
      });

      await expect(exportImportService.importBackupFile(file)).rejects.toThrow(
        'Failed to parse backup file'
      );
    });

    it('should reject backup without notes array', async () => {
      const invalidData = {
        version: '1.0.0',
        exportedAt: Date.now(),
      };

      globalThis.FileReader = createMockFileReader(JSON.stringify(invalidData)) as unknown as typeof FileReader;

      const file = new File([JSON.stringify(invalidData)], 'backup.json', {
        type: 'application/json',
      });

      await expect(exportImportService.importBackupFile(file)).rejects.toThrow(
        'Failed to parse backup file'
      );
    });
  });
});
