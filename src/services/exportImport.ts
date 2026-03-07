import html2pdf from 'html2pdf.js';
import type { Note, Folder, Tag } from '../types';
import { DATA_VERSION } from '../constants';
import { renderMarkdown } from './markdown';
import { imageService } from './image';

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

  async exportNoteAsPdf(note: Note): Promise<void> {
    const htmlContent = renderMarkdown(note.content);
    
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; color: #333;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 20px; border-bottom: 1px solid #e8e8e8; padding-bottom: 10px;">${note.title || '无标题'}</h1>
        <div style="font-size: 14px;">${htmlContent}</div>
      </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.4; }
      h1 { font-size: 2em; }
      h2 { font-size: 1.5em; border-bottom: 1px solid #e8e8e8; padding-bottom: 6px; }
      h3 { font-size: 1.25em; }
      p { margin-bottom: 16px; }
      a { color: #3498db; text-decoration: none; }
      code { background-color: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: Monaco, Menlo, 'Ubuntu Mono', monospace; font-size: 0.9em; }
      pre { background-color: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 16px; }
      pre code { background: none; padding: 0; }
      blockquote { border-left: 4px solid #3498db; padding-left: 16px; margin: 16px 0; color: #666; }
      ul, ol { padding-left: 24px; margin-bottom: 16px; }
      li { margin-bottom: 8px; }
      img { max-width: 100%; border-radius: 8px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th, td { border: 1px solid #e8e8e8; padding: 8px 12px; text-align: left; }
      th { background-color: #f5f5f5; font-weight: 600; }
      hr { border: none; border-top: 1px solid #e8e8e8; margin: 24px 0; }
    `;
    container.prepend(style);
    
    document.body.appendChild(container);
    
    try {
      const images = container.querySelectorAll<HTMLImageElement>('img[data-src^="imgstore://"]');
      const imageLoadPromises: Promise<void>[] = [];
      
      images.forEach((img) => {
        const dataSrc = img.getAttribute('data-src');
        if (!dataSrc) return;
        
        const imageId = dataSrc.replace('imgstore://', '').replace(/\s*=\s*.+$/, '');
        
        const loadPromise = (async () => {
          try {
            const blob = await imageService.getImageData(imageId);
            if (blob) {
              const base64 = await this.blobToBase64(blob);
              img.src = base64;
              img.removeAttribute('data-src');
              this.applyImageSize(img);
            } else {
              img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E图片丢失%3C/text%3E%3C/svg%3E';
            }
          } catch {
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E加载失败%3C/text%3E%3C/svg%3E';
          }
        })();
        
        imageLoadPromises.push(loadPromise);
      });
      
      await Promise.all(imageLoadPromises);
      
      const normalImages = container.querySelectorAll<HTMLImageElement>('img:not([data-src])');
      normalImages.forEach((img) => {
        this.applyImageSize(img);
      });
      
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${note.title || 'untitled'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };
      
      await html2pdf().set(opt).from(container).save();
    } finally {
      document.body.removeChild(container);
    }
  },

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  applyImageSize(img: HTMLImageElement): void {
    const widthAttr = img.getAttribute('width');
    const heightAttr = img.getAttribute('height');
    const widthPercent = img.getAttribute('data-width-percent');
    const heightPercent = img.getAttribute('data-height-percent');
    
    if (widthPercent) {
      img.style.width = `${widthPercent}%`;
      img.style.height = 'auto';
    } else if (widthAttr) {
      const width = parseInt(widthAttr, 10);
      if (!isNaN(width)) {
        img.style.maxWidth = `${width}px`;
        img.style.width = '100%';
        img.style.height = 'auto';
      }
    }
    
    if (heightPercent) {
      img.style.height = `${heightPercent}%`;
    } else if (heightAttr && !widthPercent && !widthAttr) {
      const height = parseInt(heightAttr, 10);
      if (!isNaN(height)) {
        img.style.height = `${height}px`;
        img.style.width = 'auto';
      }
    }
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
