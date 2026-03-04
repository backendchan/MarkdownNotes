import { describe, it, expect } from 'vitest';
import { insertMarkdown } from './markdown';
import type { ToolbarAction } from '../components/business/EditorToolbar';

describe('insertMarkdown', () => {
  const boldAction: ToolbarAction = {
    type: 'bold',
    prefix: '**',
    suffix: '**',
    placeholder: '粗体文本',
  };

  const h1Action: ToolbarAction = {
    type: 'heading1',
    prefix: '# ',
    suffix: '',
    placeholder: '标题',
  };

  const linkAction: ToolbarAction = {
    type: 'link',
    prefix: '[',
    suffix: '](url)',
    placeholder: '链接文本',
  };

  it('should wrap selected text with prefix and suffix', () => {
    const content = 'Hello World';
    const selection = { start: 0, end: 11 };
    
    const result = insertMarkdown(content, selection, boldAction);
    
    expect(result.text).toBe('**Hello World**');
    expect(result.selection.start).toBe(2);
    expect(result.selection.end).toBe(13);
  });

  it('should insert placeholder when no text is selected', () => {
    const content = 'Hello World';
    const selection = { start: 5, end: 5 };
    
    const result = insertMarkdown(content, selection, boldAction);
    
    expect(result.text).toBe('Hello**粗体文本** World');
    expect(result.selection.start).toBe(7);
    expect(result.selection.end).toBe(11);
  });

  it('should insert heading at the beginning', () => {
    const content = 'Title';
    const selection = { start: 0, end: 5 };
    
    const result = insertMarkdown(content, selection, h1Action);
    
    expect(result.text).toBe('# Title');
    expect(result.selection.start).toBe(2);
    expect(result.selection.end).toBe(7);
  });

  it('should insert link with placeholder', () => {
    const content = 'Click here';
    const selection = { start: 0, end: 10 };
    
    const result = insertMarkdown(content, selection, linkAction);
    
    expect(result.text).toBe('[Click here](url)');
    expect(result.selection.start).toBe(1);
    expect(result.selection.end).toBe(11);
  });

  it('should handle empty content', () => {
    const content = '';
    const selection = { start: 0, end: 0 };
    
    const result = insertMarkdown(content, selection, boldAction);
    
    expect(result.text).toBe('**粗体文本**');
  });

  it('should handle selection in the middle of content', () => {
    const content = 'The quick brown fox';
    const selection = { start: 4, end: 9 };
    
    const result = insertMarkdown(content, selection, boldAction);
    
    expect(result.text).toBe('The **quick** brown fox');
    expect(result.selection.start).toBe(6);
    expect(result.selection.end).toBe(11);
  });

  it('should handle action without placeholder', () => {
    const hrAction: ToolbarAction = {
      type: 'hr',
      prefix: '\n---\n',
      suffix: '',
    };
    
    const content = 'Hello';
    const selection = { start: 5, end: 5 };
    
    const result = insertMarkdown(content, selection, hrAction);
    
    expect(result.text).toBe('Hello\n---\n');
    expect(result.selection.start).toBe(10);
    expect(result.selection.end).toBe(10);
  });
});
