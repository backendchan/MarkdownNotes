import type { ToolbarAction } from '../components/business/EditorToolbar';

export interface TextSelection {
  start: number;
  end: number;
}

export interface InsertResult {
  text: string;
  selection: TextSelection;
}

export const insertMarkdown = (
  content: string,
  selection: TextSelection,
  action: ToolbarAction
): InsertResult => {
  const { start, end } = selection;
  const selectedText = content.substring(start, end);
  const { prefix, suffix, placeholder } = action;
  
  const textToInsert = selectedText || placeholder || '';
  const newText = prefix + textToInsert + suffix;
  
  const newContent = content.substring(0, start) + newText + content.substring(end);
  
  let newSelection: TextSelection;
  if (selectedText) {
    newSelection = {
      start: start + prefix.length,
      end: start + prefix.length + selectedText.length,
    };
  } else if (placeholder) {
    newSelection = {
      start: start + prefix.length,
      end: start + prefix.length + placeholder.length,
    };
  } else {
    newSelection = {
      start: start + newText.length,
      end: start + newText.length,
    };
  }
  
  return {
    text: newContent,
    selection: newSelection,
  };
};

export const getSelection = (textarea: HTMLTextAreaElement): TextSelection => ({
  start: textarea.selectionStart,
  end: textarea.selectionEnd,
});

export const setSelection = (textarea: HTMLTextAreaElement, selection: TextSelection) => {
  textarea.setSelectionRange(selection.start, selection.end);
  textarea.focus();
};
