import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useNoteStore, useSettingStore, useTagStore } from '../../../store';
import { storageService } from '../../../services';
import { extractTitle } from '../../../services/markdown';
import { debounce, insertMarkdown, getSelection, setSelection } from '../../../utils';
import type { ToolbarAction } from '../EditorToolbar';
import { EditorToolbar } from '../EditorToolbar';
import { TagSelector } from '../TagSelector';
import { FolderSelector } from '../FolderSelector';
import { ImageUploader } from '../ImageUploader';
import styles from './styles.module.css';

interface EditorProps {
  noteId: string;
  onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
}

export const Editor = ({ noteId, onScroll }: EditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { notes, updateNote } = useNoteStore();
  const { settings } = useSettingStore();
  const { tags, setTags } = useTagStore();
  const note = notes.find((n) => n.id === noteId);
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);

  const saveNote = useCallback(
    async (content: string, noteTags?: string[]) => {
      if (!note) return;
      const title = extractTitle(content) || '无标题';
      const updates: Partial<typeof note> = {
        content,
        title,
        updatedAt: Date.now(),
      };
      if (noteTags !== undefined) {
        updates.tags = noteTags;
      }
      updateNote(noteId, updates);
      const updatedNotes = notes.map((n) =>
        n.id === noteId ? { ...n, ...updates } : n
      );
      await storageService.saveNotes(updatedNotes);
      await storageService.saveTags(tags);
    },
    [note, noteId, notes, updateNote, tags]
  );

  const debouncedSave = useMemo(
    () => debounce((content: string) => saveNote(content), settings.autoSaveInterval),
    [saveNote, settings.autoSaveInterval]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    debouncedSave(content);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (onScroll) {
      onScroll(e);
    }
  };

  const handleToolbarAction = useCallback((action: ToolbarAction) => {
    if (action.type === 'image') {
      setIsImageUploaderOpen(true);
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const selection = getSelection(textarea);
    const result = insertMarkdown(textarea.value, selection, action);
    
    textarea.value = result.text;
    setSelection(textarea, result.selection);
    
    debouncedSave(result.text);
  }, [debouncedSave]);

  const handleImageInsert = useCallback((markdown: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selection = getSelection(textarea);
    const newContent = textarea.value.substring(0, selection.start) + 
                       markdown + 
                       textarea.value.substring(selection.end);
    
    textarea.value = newContent;
    const newPosition = selection.start + markdown.length;
    setSelection(textarea, { start: newPosition, end: newPosition });
    
    debouncedSave(newContent);
  }, [debouncedSave]);

  const handleTagsChange = useCallback(
    async (newTags: string[]) => {
      if (!note) return;
      await saveNote(note.content, newTags);
      setTags(tags);
    },
    [note, saveNote, tags, setTags]
  );

  useEffect(() => {
    if (textareaRef.current && note) {
      textareaRef.current.value = note.content;
    }
  }, [noteId, note]);

  if (!note) {
    return (
      <div className={styles.empty}>
        <p>请选择或创建一个笔记</p>
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      <EditorToolbar onAction={handleToolbarAction} />
      <div className={styles.metaSection}>
        <TagSelector
          selectedTags={note.tags || []}
          onTagsChange={handleTagsChange}
        />
        <FolderSelector
          currentFolderId={note.folderId}
          noteId={note.id}
        />
      </div>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        onChange={handleChange}
        onScroll={handleScroll}
        placeholder="开始输入 Markdown 内容..."
        style={{
          fontSize: settings.editorFontSize,
          fontFamily: settings.editorFontFamily,
        }}
        spellCheck={false}
      />
      <ImageUploader
        open={isImageUploaderOpen}
        onClose={() => setIsImageUploaderOpen(false)}
        onInsert={handleImageInsert}
        noteId={noteId}
      />
    </div>
  );
};
