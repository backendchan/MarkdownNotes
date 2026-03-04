import type { Note, Folder, Tag } from '../types';
import { DATA_VERSION } from '../constants';

export interface ExportData {
  version: string;
  exportedAt: number;
  notes: Note[];
  tags?: Tag[];
  folders?: Folder[];
}

export const exportImportService = {
  exportNoteAsMarkdown(note: Note): void {
    const markdown = `${note.content}`;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title || 'untitled'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportAllNotes(notes: Note[], tags?: Tag[], folders?: Folder[]): void {
    const exportData: ExportData = {
      version: DATA_VERSION,
      exportedAt: Date.now(),
      notes,
      tags,
      folders,
    };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `markdown-notes-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  parseMarkdownFile(content: string): Partial<Note> {
    const lines = content.split('\n');
    let title = '';
    let contentStartIndex = 0;

    if (lines[0]?.startsWith('# ')) {
      title = lines[0].substring(2).trim();
      contentStartIndex = lines[1]?.trim() === '' ? 2 : 1;
    }

    const noteContent = lines.slice(contentStartIndex).join('\n');

    return {
      title,
      content: noteContent,
    };
  },

  async importMarkdownFile(file: File): Promise<Partial<Note>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const noteData = this.parseMarkdownFile(content);
          resolve(noteData);
        } catch {
          reject(new Error('Failed to parse markdown file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  async importBackupFile(file: File): Promise<ExportData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content) as ExportData;

          if (!data.version || !Array.isArray(data.notes)) {
            throw new Error('Invalid backup file format');
          }

          resolve(data);
        } catch {
          reject(new Error('Failed to parse backup file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  validateBackupData(data: unknown): data is ExportData {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    return (
      typeof obj.version === 'string' && Array.isArray(obj.notes)
    );
  },
};
