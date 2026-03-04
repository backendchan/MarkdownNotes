import { useMemo, forwardRef } from 'react';
import { useNoteStore, useSettingStore } from '../../../store';
import { renderMarkdown } from '../../../services/markdown';
import styles from './styles.module.css';

interface PreviewProps {
  noteId: string;
}

export const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ noteId }, ref) => {
  const { notes } = useNoteStore();
  const { settings } = useSettingStore();
  const note = notes.find((n) => n.id === noteId);

  const htmlContent = useMemo(() => {
    if (!note) return '';
    return renderMarkdown(note.content);
  }, [note]);

  if (!note) {
    return (
      <div className={styles.empty}>
        <p>预览区域</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={styles.preview}
      style={{
        fontSize: settings.previewFontSize,
      }}
    >
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
});

Preview.displayName = 'Preview';
