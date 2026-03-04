import { useEffect, useCallback, useRef } from 'react';
import { Layout, Header, Sidebar, Editor, Preview, ResizablePanel } from '../../components';
import { useNoteStore, useSettingStore, useTagStore, useFolderStore } from '../../store';
import { storageService } from '../../services';
import { generateId } from '../../utils';
import styles from './styles.module.css';

export const HomePage = () => {
  const { notes, currentNoteId, setNotes, setCurrentNote, addNote, isLoading, setIsLoading } =
    useNoteStore();
  const { settings, updateSettings } = useSettingStore();
  const { setTags } = useTagStore();
  const { setFolders } = useFolderStore();
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedNotes = await storageService.getNotes();
        setNotes(savedNotes);
        if (savedNotes.length > 0) {
          setCurrentNote(savedNotes[0].id);
        }

        const savedTags = await storageService.getTags();
        setTags(savedTags);

        const savedFolders = await storageService.getFolders();
        setFolders(savedFolders);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [setNotes, setCurrentNote, setIsLoading, setTags, setFolders]);

  const handleCreateNote = useCallback(async () => {
    const newNote = {
      id: generateId(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addNote(newNote);
    setCurrentNote(newNote.id);
    await storageService.saveNotes([newNote, ...notes]);
  }, [addNote, setCurrentNote, notes]);

  const handleEditorScroll = useCallback(
    (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (!settings.syncScroll || !previewRef.current) return;
      const textarea = e.currentTarget;
      const preview = previewRef.current;
      const scrollRatio =
        textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
      const previewScrollTop = scrollRatio * (preview.scrollHeight - preview.clientHeight);
      preview.scrollTop = previewScrollTop;
    },
    [settings.syncScroll]
  );

  const handleEditorWidthChange = useCallback(
    (width: number) => {
      updateSettings({ editorWidth: width });
    },
    [updateSettings]
  );

  const handleSidebarWidthChange = useCallback(
    (width: number) => {
      updateSettings({ sidebarWidth: width });
    },
    [updateSettings]
  );

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.loading}>加载中...</div>
      </Layout>
    );
  }

  const editorContent = currentNoteId ? (
    <ResizablePanel
      left={<Editor noteId={currentNoteId} onScroll={handleEditorScroll} />}
      right={<Preview ref={previewRef} noteId={currentNoteId} />}
      leftWidth={settings.editorWidth}
      onLeftWidthChange={handleEditorWidthChange}
      minWidth={300}
      maxWidth={800}
      className={styles.editorArea}
    />
  ) : (
    <div className={styles.empty}>
      <h2>欢迎使用 Markdown Notes</h2>
      <p>点击"新建"按钮创建您的第一篇笔记</p>
    </div>
  );

  return (
    <Layout>
      <Header onCreateNote={handleCreateNote} />
      <ResizablePanel
        left={<Sidebar />}
        right={editorContent}
        leftWidth={settings.sidebarWidth}
        onLeftWidthChange={handleSidebarWidthChange}
        minWidth={200}
        maxWidth={400}
        className={styles.main}
      />
    </Layout>
  );
};
